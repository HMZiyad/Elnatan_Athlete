package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/uag/backend/internal/models"
)

// OrderRepository handles order creation and retrieval.
type OrderRepository struct {
	db *pgxpool.Pool
}

func NewOrderRepository(db *pgxpool.Pool) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(ctx context.Context, o *models.Order, items []models.CartItem) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	o.ID = uuid.New()

	// Snapshot shipping address as JSON
	var addrJSON []byte
	if o.ShippingAddress != nil {
		addrJSON, _ = json.Marshal(o.ShippingAddress)
	}

	err = tx.QueryRow(ctx, `
		INSERT INTO orders (id, order_number, user_id, address_id, payment_method_id, status, subtotal, shipping, tax, total, stripe_payment_intent_id, shipping_address, referral_athlete_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING created_at, updated_at`,
		o.ID, o.OrderNumber, o.UserID, nil, nil, o.Status,
		o.Subtotal, o.Shipping, o.Tax, o.Total, o.StripePaymentIntentID, addrJSON, o.ReferralAthleteID,
	).Scan(&o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return fmt.Errorf("inserting order: %w", err)
	}

	// Insert order items
	for _, item := range items {
		_, err = tx.Exec(ctx, `
			INSERT INTO order_items (id, order_id, product_id, name, size, color, price, quantity, image_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			uuid.New(), o.ID, item.ProductID, item.Name, item.Size, item.Color,
			item.Price, item.Quantity, item.ImageURL,
		)
		if err != nil {
			return fmt.Errorf("inserting order item: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *OrderRepository) FindByID(ctx context.Context, orderID, userID uuid.UUID) (*models.Order, error) {
	o := &models.Order{}
	var addrJSON []byte
	err := r.db.QueryRow(ctx, `
		SELECT id, order_number, user_id, status, subtotal, shipping, tax, total, shipping_address, created_at, updated_at
		FROM orders WHERE id = $1 AND user_id = $2`,
		orderID, userID,
	).Scan(&o.ID, &o.OrderNumber, &o.UserID, &o.Status, &o.Subtotal, &o.Shipping, &o.Tax, &o.Total, &addrJSON, &o.CreatedAt, &o.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if addrJSON != nil {
		o.ShippingAddress = &models.Address{}
		_ = json.Unmarshal(addrJSON, o.ShippingAddress)
	}

	// Load items
	items, err := r.ListOrderItems(ctx, o.ID)
	if err != nil {
		return nil, err
	}
	o.Items = items

	return o, nil
}

func (r *OrderRepository) ListByUserID(ctx context.Context, userID uuid.UUID, status string, page, perPage int) ([]models.Order, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE user_id = $1"
	args := []interface{}{userID}
	i := 2

	if status != "" {
		where += fmt.Sprintf(" AND status = $%d", i)
		args = append(args, status)
		i++
	}

	var total int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM orders `+where, args[:i-1]...).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT id, order_number, status, subtotal, shipping, tax, total, created_at
		FROM orders %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		o := models.Order{}
		if err := rows.Scan(&o.ID, &o.OrderNumber, &o.Status, &o.Subtotal, &o.Shipping, &o.Tax, &o.Total, &o.CreatedAt); err != nil {
			return nil, 0, err
		}
		orders = append(orders, o)
	}
	return orders, total, nil
}

func (r *OrderRepository) ListOrderItems(ctx context.Context, orderID uuid.UUID) ([]models.OrderItem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, order_id, product_id, name, size, color, price, quantity, image_url, created_at
		FROM order_items WHERE order_id = $1`, orderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		item := models.OrderItem{}
		if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Name, &item.Size, &item.Color,
			&item.Price, &item.Quantity, &item.ImageURL, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func (r *OrderRepository) UpdateStatus(ctx context.Context, orderID uuid.UUID, status models.OrderStatus) error {
	_, err := r.db.Exec(ctx, `UPDATE orders SET status = $1 WHERE id = $2`, status, orderID)
	return err
}

func (r *OrderRepository) FindByStripePaymentIntent(ctx context.Context, intentID string) (*models.Order, error) {
	o := &models.Order{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, status FROM orders WHERE stripe_payment_intent_id = $1`, intentID,
	).Scan(&o.ID, &o.UserID, &o.Status)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return o, err
}

// Admin-facing
func (r *OrderRepository) ListAllAdmin(ctx context.Context, search, status string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE 1=1"
	args := []interface{}{}
	i := 1

	if status != "" {
		where += fmt.Sprintf(" AND o.status = $%d", i)
		args = append(args, status)
		i++
	}
	if search != "" {
		where += fmt.Sprintf(" AND (o.order_number ILIKE $%d OR u.full_name ILIKE $%d OR u.email ILIKE $%d)", i, i, i)
		args = append(args, "%"+search+"%")
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id `+where, cArgs...,
	).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT o.id, o.order_number, u.full_name, u.email, o.created_at::DATE, o.total, o.status,
		       (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
		FROM orders o
		JOIN users u ON o.user_id = u.id
		%s ORDER BY o.created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var (
			id, orderNumber, customerName, customerEmail, status string
			date                                                 time.Time
			total                                                float64
			itemCount                                            int
		)
		if err := rows.Scan(&id, &orderNumber, &customerName, &customerEmail, &date, &total, &status, &itemCount); err != nil {
			fmt.Printf("Scan error: %v\n", err)
			return nil, 0, err
		}
		result = append(result, map[string]interface{}{
			"id": id, "order_number": orderNumber, "customer_name": customerName,
			"customer_email": customerEmail, "date": date.Format("2006-01-02"), "total": total,
			"status": status, "item_count": itemCount,
		})
	}
	return result, total, nil
}
