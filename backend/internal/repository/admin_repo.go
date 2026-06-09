package repository

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/uag/backend/internal/models"
)

// AdminRepository handles admin-specific database operations.
type AdminRepository struct {
	db *pgxpool.Pool
}

func NewAdminRepository(db *pgxpool.Pool) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) Create(ctx context.Context, a *models.Admin) error {
	a.ID = uuid.New()
	return r.db.QueryRow(ctx,
		`INSERT INTO admins (id, email, password_hash) VALUES ($1, $2, $3) RETURNING created_at, updated_at`,
		a.ID, a.Email, a.PasswordHash,
	).Scan(&a.CreatedAt, &a.UpdatedAt)
}

func (r *AdminRepository) FindByEmail(ctx context.Context, email string) (*models.Admin, error) {
	a := &models.Admin{}
	err := r.db.QueryRow(ctx,
		`SELECT id, email, password_hash, created_at, updated_at FROM admins WHERE email = $1`, email,
	).Scan(&a.ID, &a.Email, &a.PasswordHash, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return a, err
}

func (r *AdminRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Admin, error) {
	a := &models.Admin{}
	err := r.db.QueryRow(ctx,
		`SELECT id, email, password_hash, created_at, updated_at FROM admins WHERE id = $1`, id,
	).Scan(&a.ID, &a.Email, &a.PasswordHash, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return a, err
}

func (r *AdminRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM admins WHERE email = $1)`, email,
	).Scan(&exists)
	return exists, err
}

func (r *AdminRepository) AnyAdminExists(ctx context.Context) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM admins LIMIT 1)`).Scan(&exists)
	return exists, err
}

func (r *AdminRepository) UpdatePassword(ctx context.Context, adminID uuid.UUID, hash string) error {
	_, err := r.db.Exec(ctx, `UPDATE admins SET password_hash = $1 WHERE id = $2`, hash, adminID)
	return err
}

// OTP codes
func (r *AdminRepository) SaveOTPCode(ctx context.Context, adminID uuid.UUID, codeHash string, expiresAt interface{}) error {
	// Invalidate old codes first
	_, _ = r.db.Exec(ctx, `UPDATE admin_otp_codes SET used = TRUE WHERE admin_id = $1`, adminID)
	_, err := r.db.Exec(ctx,
		`INSERT INTO admin_otp_codes (id, admin_id, code_hash, expires_at) VALUES ($1, $2, $3, $4)`,
		uuid.New(), adminID, codeHash, expiresAt,
	)
	return err
}

func (r *AdminRepository) FindValidOTP(ctx context.Context, adminID uuid.UUID, codeHash string) error {
	var id uuid.UUID
	err := r.db.QueryRow(ctx,
		`SELECT id FROM admin_otp_codes WHERE admin_id=$1 AND code_hash=$2 AND used=FALSE AND expires_at > NOW()`,
		adminID, codeHash,
	).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	return err
}

func (r *AdminRepository) MarkOTPUsed(ctx context.Context, adminID uuid.UUID, codeHash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE admin_otp_codes SET used = TRUE WHERE admin_id = $1 AND code_hash = $2`,
		adminID, codeHash,
	)
	return err
}

// Dashboard stats
func (r *AdminRepository) GetStats(ctx context.Context) (map[string]interface{}, error) {
	stats := map[string]interface{}{}

	var totalOrders, totalProducts, totalCustomers, totalAthletes, pendingVerifications int
	var totalRevenue float64

	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM orders`).Scan(&totalOrders)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM products`).Scan(&totalProducts)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'fan'`).Scan(&totalCustomers)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE role = 'athlete'`).Scan(&totalAthletes)
	_ = r.db.QueryRow(ctx, `SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'Cancelled'`).Scan(&totalRevenue)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM athlete_profiles WHERE verification_status = 'pending'`).Scan(&pendingVerifications)

	// Weekly order chart
	rows, err := r.db.Query(ctx, `
		SELECT TO_CHAR(created_at, 'Dy') as day, COUNT(*) as orders
		FROM orders
		WHERE created_at >= NOW() - INTERVAL '7 days'
		GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at)
		ORDER BY DATE(created_at)
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chart []map[string]interface{}
	for rows.Next() {
		var day string
		var count int
		if err := rows.Scan(&day, &count); err != nil {
			continue
		}
		chart = append(chart, map[string]interface{}{"day": day, "orders": count})
	}

	stats["total_orders"] = totalOrders
	stats["total_products"] = totalProducts
	stats["total_customers"] = totalCustomers
	stats["total_athletes"] = totalAthletes
	stats["total_revenue"] = totalRevenue
	stats["pending_verifications"] = pendingVerifications
	stats["weekly_order_chart"] = chart

	return stats, nil
}

// Customers
func (r *AdminRepository) ListCustomers(ctx context.Context, search string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE u.role = 'fan'"
	args := []interface{}{}
	i := 1

	if search != "" {
		where += fmt.Sprintf(" AND (u.full_name ILIKE $%d OR u.email ILIKE $%d)", i, i)
		args = append(args, "%"+search+"%")
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users u `+where, cArgs...).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT u.id, u.full_name, u.email,
		       COUNT(o.id) as total_orders,
		       COALESCE(SUM(o.total), 0) as total_spent,
		       u.created_at
		FROM users u
		LEFT JOIN orders o ON o.user_id = u.id
		%s
		GROUP BY u.id
		ORDER BY u.created_at DESC
		LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var id, fullName, email, createdAt string
		var totalOrders int
		var totalSpent float64
		if err := rows.Scan(&id, &fullName, &email, &totalOrders, &totalSpent, &createdAt); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"id": id, "full_name": fullName, "email": email,
			"total_orders": totalOrders, "total_spent": totalSpent, "joined_at": createdAt,
		})
	}
	return result, total, nil
}

// Notifications
func (r *AdminRepository) GetRecentNotifications(ctx context.Context) ([]map[string]interface{}, error) {
	var notifications []map[string]interface{}

	// 1. New Orders
	rowsOrders, err := r.db.Query(ctx, `
		SELECT o.id, o.order_number, u.full_name, o.created_at
		FROM orders o
		JOIN users u ON o.user_id = u.id
		WHERE o.status != 'Delivered' AND o.status != 'Cancelled'
		ORDER BY o.created_at DESC LIMIT 5
	`)
	if err == nil {
		defer rowsOrders.Close()
		for rowsOrders.Next() {
			var id, orderNum, fullName string
			var createdAt time.Time
			if err := rowsOrders.Scan(&id, &orderNum, &fullName, &createdAt); err == nil {
				notifications = append(notifications, map[string]interface{}{
					"id":        id,
					"type":      "new_order",
					"title":     fmt.Sprintf("New Order #%s by %s", orderNum, fullName),
					"timestamp": createdAt,
					"read":      false,
				})
			}
		}
	}

	// 2. Delivered Orders
	rowsDelivered, err := r.db.Query(ctx, `
		SELECT o.id, o.order_number, u.full_name, o.updated_at
		FROM orders o
		JOIN users u ON o.user_id = u.id
		WHERE o.status = 'Delivered'
		ORDER BY o.updated_at DESC LIMIT 5
	`)
	if err == nil {
		defer rowsDelivered.Close()
		for rowsDelivered.Next() {
			var id, orderNum, fullName string
			var updatedAt time.Time
			if err := rowsDelivered.Scan(&id, &orderNum, &fullName, &updatedAt); err == nil {
				notifications = append(notifications, map[string]interface{}{
					"id":        id,
					"type":      "delivered_order",
					"title":     fmt.Sprintf("Order #%s by %s was delivered", orderNum, fullName),
					"timestamp": updatedAt,
					"read":      false,
				})
			}
		}
	}

	// 3. Pending Athletes
	rowsAthletes, err := r.db.Query(ctx, `
		SELECT ap.id, u.full_name, ap.created_at
		FROM athlete_profiles ap
		JOIN users u ON ap.user_id = u.id
		WHERE ap.verification_status = 'pending'
		ORDER BY ap.created_at DESC LIMIT 5
	`)
	if err == nil {
		defer rowsAthletes.Close()
		for rowsAthletes.Next() {
			var id, fullName string
			var createdAt time.Time
			if err := rowsAthletes.Scan(&id, &fullName, &createdAt); err == nil {
				notifications = append(notifications, map[string]interface{}{
					"id":        id,
					"type":      "athlete_application",
					"title":     fmt.Sprintf("New athlete application: %s", fullName),
					"timestamp": createdAt,
					"read":      false,
				})
			}
		}
	}

	if len(notifications) == 0 {
		return []map[string]interface{}{}, nil
	}

	// Sort notifications by timestamp descending
	sort.Slice(notifications, func(i, j int) bool {
		tI := notifications[i]["timestamp"].(time.Time)
		tJ := notifications[j]["timestamp"].(time.Time)
		return tI.After(tJ)
	})

	// Return top 10
	if len(notifications) > 10 {
		notifications = notifications[:10]
	}

	return notifications, nil
}

// Withdrawals
func (r *AdminRepository) ListWithdrawals(ctx context.Context, status string, page, perPage int) ([]models.WithdrawalDetail, int, error) {
	offset := (page - 1) * perPage
	where := ""
	var args []interface{}
	i := 1

	if status != "" {
		where = fmt.Sprintf("WHERE w.status = $%d", i)
		args = append(args, status)
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM withdrawals w `+where, cArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	args = append(args, perPage, offset)
	query := fmt.Sprintf(`
		SELECT w.id, w.athlete_id, u.full_name, w.amount, w.status, w.rejection_reason, w.created_at, w.updated_at
		FROM withdrawals w
		JOIN athlete_profiles ap ON w.athlete_id = ap.id
		JOIN users u ON ap.user_id = u.id
		%s
		ORDER BY w.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, i, i+1)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []models.WithdrawalDetail
	for rows.Next() {
		var d models.WithdrawalDetail
		if err := rows.Scan(&d.ID, &d.AthleteID, &d.AthleteName, &d.Amount, &d.Status, &d.RejectionReason, &d.CreatedAt, &d.UpdatedAt); err != nil {
			continue
		}
		result = append(result, d)
	}

	return result, total, nil
}

func (r *AdminRepository) GetWithdrawal(ctx context.Context, id uuid.UUID) (*models.WithdrawalDetail, *string, error) {
	var d models.WithdrawalDetail
	var apConnectID *string
	err := r.db.QueryRow(ctx, `
		SELECT w.id, w.athlete_id, u.full_name, w.amount, w.status, w.rejection_reason, w.created_at, w.updated_at, ap.stripe_connect_account_id
		FROM withdrawals w
		JOIN athlete_profiles ap ON w.athlete_id = ap.id
		JOIN users u ON ap.user_id = u.id
		WHERE w.id = $1
	`, id).Scan(&d.ID, &d.AthleteID, &d.AthleteName, &d.Amount, &d.Status, &d.RejectionReason, &d.CreatedAt, &d.UpdatedAt, &apConnectID)
	
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil, ErrNotFound
	}
	return &d, apConnectID, err
}

func (r *AdminRepository) RejectWithdrawal(ctx context.Context, id uuid.UUID, reason string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var athleteID uuid.UUID
	var amount float64
	var status string
	err = tx.QueryRow(ctx, `
		SELECT athlete_id, amount, status FROM withdrawals WHERE id = $1 FOR UPDATE
	`, id).Scan(&athleteID, &amount, &status)
	if err != nil {
		return err
	}

	if status != "processing" {
		return fmt.Errorf("can only reject processing withdrawals")
	}

	// Update withdrawal
	_, err = tx.Exec(ctx, `
		UPDATE withdrawals 
		SET status = 'rejected', rejection_reason = $1, updated_at = NOW() 
		WHERE id = $2
	`, reason, id)
	if err != nil {
		return err
	}

	// Move funds back from pending to available
	_, err = tx.Exec(ctx, `
		UPDATE athlete_profiles 
		SET pending_balance = pending_balance - $1, available_balance = available_balance + $1 
		WHERE id = $2
	`, amount, athleteID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
