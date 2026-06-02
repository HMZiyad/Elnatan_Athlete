package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/uag/backend/internal/models"
)

var ErrNotFound = errors.New("record not found")
var ErrDuplicate = errors.New("duplicate record")

// UserRepository handles database operations for users.
type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

// DB returns the underlying connection pool for ad-hoc queries.
func (r *UserRepository) DB() *pgxpool.Pool {
	return r.db
}

func (r *UserRepository) Create(ctx context.Context, u *models.User) error {
	q := `
		INSERT INTO users (id, full_name, email, password_hash, role, referred_by)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at, updated_at`

	u.ID = uuid.New()
	return r.db.QueryRow(ctx, q,
		u.ID, u.FullName, u.Email, u.PasswordHash, u.Role, u.ReferredBy,
	).Scan(&u.CreatedAt, &u.UpdatedAt)
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	u := &models.User{}
	q := `SELECT id, full_name, email, password_hash, role, avatar_url, onboarding_complete,
	             stripe_customer_id, referred_by, created_at, updated_at
	      FROM users WHERE email = $1`

	err := r.db.QueryRow(ctx, q, email).Scan(
		&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role,
		&u.AvatarURL, &u.OnboardingComplete, &u.StripeCustomerID,
		&u.ReferredBy, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	u := &models.User{}
	q := `SELECT id, full_name, email, password_hash, role, avatar_url, onboarding_complete,
	             stripe_customer_id, referred_by, created_at, updated_at
	      FROM users WHERE id = $1`

	err := r.db.QueryRow(ctx, q, id).Scan(
		&u.ID, &u.FullName, &u.Email, &u.PasswordHash, &u.Role,
		&u.AvatarURL, &u.OnboardingComplete, &u.StripeCustomerID,
		&u.ReferredBy, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepository) UpdateAvatar(ctx context.Context, userID uuid.UUID, avatarURL string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET avatar_url = $1 WHERE id = $2`,
		avatarURL, userID,
	)
	return err
}

func (r *UserRepository) UpdateStripeCustomerID(ctx context.Context, userID uuid.UUID, customerID string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
		customerID, userID,
	)
	return err
}

func (r *UserRepository) SetOnboardingComplete(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET onboarding_complete = TRUE WHERE id = $1`,
		userID,
	)
	return err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, hash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET password_hash = $1 WHERE id = $2`,
		hash, userID,
	)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, userID uuid.UUID, fullName, email, phone string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET full_name = $1, email = $2 WHERE id = $3`,
		fullName, email, userID,
	)
	return err
}

func (r *UserRepository) EmailExists(ctx context.Context, email string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, email,
	).Scan(&exists)
	return exists, err
}

// ─── Password Reset Tokens ────────────────────────────────────

func (r *UserRepository) SaveResetToken(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt interface{}) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

func (r *UserRepository) FindValidResetToken(ctx context.Context, tokenHash string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := r.db.QueryRow(ctx,
		`SELECT user_id FROM password_reset_tokens
		 WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()`,
		tokenHash,
	).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, ErrNotFound
	}
	return userID, err
}

func (r *UserRepository) MarkResetTokenUsed(ctx context.Context, tokenHash string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = $1`,
		tokenHash,
	)
	return err
}

// ─── Address Book ─────────────────────────────────────────────

func (r *UserRepository) ListAddresses(ctx context.Context, userID uuid.UUID) ([]models.Address, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, user_id, label, full_name, street, city, state, zip, country, phone, is_default, created_at, updated_at
		 FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addresses []models.Address
	for rows.Next() {
		var a models.Address
		if err := rows.Scan(&a.ID, &a.UserID, &a.Label, &a.FullName, &a.Street, &a.City,
			&a.State, &a.Zip, &a.Country, &a.Phone, &a.IsDefault, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		addresses = append(addresses, a)
	}
	return addresses, nil
}

func (r *UserRepository) CreateAddress(ctx context.Context, a *models.Address) error {
	a.ID = uuid.New()
	if a.IsDefault {
		// Unset any existing default first
		_, _ = r.db.Exec(ctx, `UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, a.UserID)
	}
	return r.db.QueryRow(ctx,
		`INSERT INTO addresses (id, user_id, label, full_name, street, city, state, zip, country, phone, is_default)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING created_at, updated_at`,
		a.ID, a.UserID, a.Label, a.FullName, a.Street, a.City, a.State, a.Zip, a.Country, a.Phone, a.IsDefault,
	).Scan(&a.CreatedAt, &a.UpdatedAt)
}

func (r *UserRepository) UpdateAddress(ctx context.Context, a *models.Address) error {
	if a.IsDefault {
		_, _ = r.db.Exec(ctx, `UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, a.UserID)
	}
	_, err := r.db.Exec(ctx,
		`UPDATE addresses SET label=$1, full_name=$2, street=$3, city=$4, state=$5, zip=$6, country=$7, phone=$8, is_default=$9
		 WHERE id=$10 AND user_id=$11`,
		a.Label, a.FullName, a.Street, a.City, a.State, a.Zip, a.Country, a.Phone, a.IsDefault, a.ID, a.UserID,
	)
	return err
}

func (r *UserRepository) DeleteAddress(ctx context.Context, addressID, userID uuid.UUID) error {
	res, err := r.db.Exec(ctx,
		`DELETE FROM addresses WHERE id = $1 AND user_id = $2`,
		addressID, userID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) SetDefaultAddress(ctx context.Context, addressID, userID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `UPDATE addresses SET is_default = FALSE WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}
	res, err := tx.Exec(ctx,
		`UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2`,
		addressID, userID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return tx.Commit(ctx)
}

func (r *UserRepository) FindAddressByID(ctx context.Context, addressID uuid.UUID) (*models.Address, error) {
	a := &models.Address{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, label, full_name, street, city, state, zip, country, phone, is_default, created_at, updated_at
		 FROM addresses WHERE id = $1`,
		addressID,
	).Scan(&a.ID, &a.UserID, &a.Label, &a.FullName, &a.Street, &a.City,
		&a.State, &a.Zip, &a.Country, &a.Phone, &a.IsDefault, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return a, err
}

// ─── Payment Methods ──────────────────────────────────────────

func (r *UserRepository) ListPaymentMethods(ctx context.Context, userID uuid.UUID) ([]models.PaymentMethod, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, user_id, stripe_pm_id, brand, last_four, expires_month, expires_year, is_default, created_at
		 FROM payment_methods WHERE user_id = $1 ORDER BY is_default DESC, created_at ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pms []models.PaymentMethod
	for rows.Next() {
		var pm models.PaymentMethod
		if err := rows.Scan(&pm.ID, &pm.UserID, &pm.StripePMID, &pm.Brand, &pm.LastFour,
			&pm.ExpiresMonth, &pm.ExpiresYear, &pm.IsDefault, &pm.CreatedAt); err != nil {
			return nil, err
		}
		pms = append(pms, pm)
	}
	return pms, nil
}

func (r *UserRepository) CreatePaymentMethod(ctx context.Context, pm *models.PaymentMethod) error {
	pm.ID = uuid.New()
	if pm.IsDefault {
		_, _ = r.db.Exec(ctx, `UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1`, pm.UserID)
	}
	return r.db.QueryRow(ctx,
		`INSERT INTO payment_methods (id, user_id, stripe_pm_id, brand, last_four, expires_month, expires_year, is_default)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING created_at`,
		pm.ID, pm.UserID, pm.StripePMID, pm.Brand, pm.LastFour, pm.ExpiresMonth, pm.ExpiresYear, pm.IsDefault,
	).Scan(&pm.CreatedAt)
}

func (r *UserRepository) FindPaymentMethodByID(ctx context.Context, pmID, userID uuid.UUID) (*models.PaymentMethod, error) {
	pm := &models.PaymentMethod{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, stripe_pm_id, brand, last_four, expires_month, expires_year, is_default, created_at
		 FROM payment_methods WHERE id = $1 AND user_id = $2`,
		pmID, userID,
	).Scan(&pm.ID, &pm.UserID, &pm.StripePMID, &pm.Brand, &pm.LastFour,
		&pm.ExpiresMonth, &pm.ExpiresYear, &pm.IsDefault, &pm.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return pm, err
}

func (r *UserRepository) SetDefaultPaymentMethod(ctx context.Context, pmID, userID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, _ = tx.Exec(ctx, `UPDATE payment_methods SET is_default = FALSE WHERE user_id = $1`, userID)
	res, err := tx.Exec(ctx,
		`UPDATE payment_methods SET is_default = TRUE WHERE id = $1 AND user_id = $2`,
		pmID, userID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return tx.Commit(ctx)
}

func (r *UserRepository) DeletePaymentMethod(ctx context.Context, pmID, userID uuid.UUID) error {
	res, err := r.db.Exec(ctx,
		`DELETE FROM payment_methods WHERE id = $1 AND user_id = $2`,
		pmID, userID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) CountPaymentMethods(ctx context.Context, userID uuid.UUID) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM payment_methods WHERE user_id = $1`, userID,
	).Scan(&count)
	return count, err
}

// ─── Referral Links ───────────────────────────────────────────

func (r *UserRepository) CreateReferralLink(ctx context.Context, referredUserID, referrerProfileID uuid.UUID) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO referral_links (id, referred_user_id, referrer_id) VALUES ($1, $2, $3)
		 ON CONFLICT (referred_user_id) DO NOTHING`,
		uuid.New(), referredUserID, referrerProfileID,
	)
	return err
}

func (r *UserRepository) FindReferrerByUserID(ctx context.Context, userID uuid.UUID) (*uuid.UUID, error) {
	var referrerID uuid.UUID
	err := r.db.QueryRow(ctx,
		`SELECT referrer_id FROM referral_links WHERE referred_user_id = $1`, userID,
	).Scan(&referrerID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("finding referrer: %w", err)
	}
	return &referrerID, nil
}
