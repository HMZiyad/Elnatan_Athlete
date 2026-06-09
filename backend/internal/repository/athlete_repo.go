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

// AthleteRepository handles all athlete-related database operations.
type AthleteRepository struct {
	db *pgxpool.Pool
}

func NewAthleteRepository(db *pgxpool.Pool) *AthleteRepository {
	return &AthleteRepository{db: db}
}

func (r *AthleteRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*models.AthleteProfile, error) {
	ap := &models.AthleteProfile{}
	q := `SELECT id, user_id, username, date_of_birth::text, location, sport, level, position,
	             achievements, bio, highlight_clip_url,
	             stats, recent_achievements,
	             instagram_url, twitter_url, youtube_url, website_url,
	             id_document_url, verification_status, verified, verified_at, reviewer_notes,
	             agreed_to_terms, agreed_to_privacy, agreed_to_earnings_policy,
	             onboarding_step, referral_code, referral_link,
	             available_balance, lifetime_earned, pending_balance,
	             total_votes, total_profile_views, global_rank, tier, rank_movement, rank_movement_value,
	             created_at, updated_at
	      FROM athlete_profiles WHERE user_id = $1`

	err := r.db.QueryRow(ctx, q, userID).Scan(
		&ap.ID, &ap.UserID, &ap.Username, &ap.DateOfBirth, &ap.Location, &ap.Sport, &ap.Level, &ap.Position,
		&ap.Achievements, &ap.Bio, &ap.HighlightClipURL,
		&ap.Stats, &ap.RecentAchievements,
		&ap.InstagramURL, &ap.TwitterURL, &ap.YoutubeURL, &ap.WebsiteURL,
		&ap.IDDocumentURL, &ap.VerificationStatus, &ap.Verified, &ap.VerifiedAt, &ap.ReviewerNotes,
		&ap.AgreedToTerms, &ap.AgreedToPrivacy, &ap.AgreedToEarningsPolicy,
		&ap.OnboardingStep, &ap.ReferralCode, &ap.ReferralLink,
		&ap.AvailableBalance, &ap.LifetimeEarned, &ap.PendingBalance,
		&ap.TotalVotes, &ap.TotalProfileViews, &ap.GlobalRank, &ap.Tier, &ap.RankMovement, &ap.RankMovementValue,
		&ap.CreatedAt, &ap.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return ap, err
}

func (r *AthleteRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.AthleteProfile, error) {
	ap := &models.AthleteProfile{}
	q := `SELECT id, user_id, username, date_of_birth::text, location, sport, level, position,
	             achievements, bio, highlight_clip_url, stats,
	             instagram_url, twitter_url, youtube_url, website_url,
	             verification_status, verified, verified_at, reviewer_notes,
	             onboarding_step, referral_code, referral_link,
	             available_balance, lifetime_earned, pending_balance,
	             total_votes, total_profile_views, global_rank, tier, rank_movement, rank_movement_value,
	             created_at, updated_at
	      FROM athlete_profiles WHERE id = $1`

	err := r.db.QueryRow(ctx, q, id).Scan(
		&ap.ID, &ap.UserID, &ap.Username, &ap.DateOfBirth, &ap.Location, &ap.Sport, &ap.Level, &ap.Position,
		&ap.Achievements, &ap.Bio, &ap.HighlightClipURL, &ap.Stats,
		&ap.InstagramURL, &ap.TwitterURL, &ap.YoutubeURL, &ap.WebsiteURL,
		&ap.VerificationStatus, &ap.Verified, &ap.VerifiedAt, &ap.ReviewerNotes,
		&ap.OnboardingStep, &ap.ReferralCode, &ap.ReferralLink,
		&ap.AvailableBalance, &ap.LifetimeEarned, &ap.PendingBalance,
		&ap.TotalVotes, &ap.TotalProfileViews, &ap.GlobalRank, &ap.Tier, &ap.RankMovement, &ap.RankMovementValue,
		&ap.CreatedAt, &ap.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return ap, err
}

func (r *AthleteRepository) FindByReferralCode(ctx context.Context, code string) (*models.AthleteProfile, error) {
	ap := &models.AthleteProfile{}
	err := r.db.QueryRow(ctx,
		`SELECT id, user_id, referral_code FROM athlete_profiles WHERE referral_code = $1`,
		code,
	).Scan(&ap.ID, &ap.UserID, &ap.ReferralCode)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return ap, err
}

func (r *AthleteRepository) Create(ctx context.Context, userID uuid.UUID) (*models.AthleteProfile, error) {
	ap := &models.AthleteProfile{ID: uuid.New(), UserID: userID}
	err := r.db.QueryRow(ctx,
		`INSERT INTO athlete_profiles (id, user_id) VALUES ($1, $2) RETURNING created_at, updated_at`,
		ap.ID, ap.UserID,
	).Scan(&ap.CreatedAt, &ap.UpdatedAt)
	return ap, err
}

func (r *AthleteRepository) UpdateIdentityStep(ctx context.Context, userID uuid.UUID, fullName, username, dob, location, avatarURL string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles
		 SET username=$1, date_of_birth=$2, location=$3, onboarding_step=GREATEST(onboarding_step, 1)
		 WHERE user_id=$4`,
		username, dob, location, userID,
	)
	if err != nil {
		return err
	}
	// Also update user table
	_, err = r.db.Exec(ctx,
		`UPDATE users SET full_name=$1, avatar_url=$2 WHERE id=$3`,
		fullName, avatarURL, userID,
	)
	return err
}

func (r *AthleteRepository) UpdateSportStep(ctx context.Context, userID uuid.UUID,
	sport, level string, stats map[string]string, achievements string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles
		 SET sport=$1, level=$2, stats=$3, recent_achievements=$4,
		     onboarding_step=GREATEST(onboarding_step, 2)
		 WHERE user_id=$5`,
		sport, level, stats, achievements, userID,
	)
	return err
}

func (r *AthleteRepository) UpdateStoryStep(ctx context.Context, userID uuid.UUID,
	bio, clipURL, instagram, twitter, youtube, website string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles
		 SET bio=$1, highlight_clip_url=$2, instagram_url=$3, twitter_url=$4,
		     youtube_url=$5, website_url=$6, onboarding_step=GREATEST(onboarding_step, 3)
		 WHERE user_id=$7`,
		bio, clipURL, instagram, twitter, youtube, website, userID,
	)
	return err
}

func (r *AthleteRepository) UpdateTermsStep(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles
		 SET agreed_to_terms=TRUE, agreed_to_privacy=TRUE, agreed_to_earnings_policy=TRUE,
		     onboarding_step=GREATEST(onboarding_step, 4)
		 WHERE user_id=$1`,
		userID,
	)
	return err
}

func (r *AthleteRepository) UpdateVerificationStep(ctx context.Context, userID uuid.UUID, docURL, referralCode, referralLink string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles
		 SET id_document_url=$1, verification_status='pending', referral_code=$2, referral_link=$3,
		     onboarding_step=5
		 WHERE user_id=$4`,
		docURL, referralCode, referralLink, userID,
	)
	return err
}

func (r *AthleteRepository) UsernameExists(ctx context.Context, username string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM athlete_profiles WHERE username = $1)`, username,
	).Scan(&exists)
	return exists, err
}

func (r *AthleteRepository) UpdateProfile(ctx context.Context, userID uuid.UUID, fields map[string]interface{}) error {
	// Build dynamic update
	q := `UPDATE athlete_profiles SET `
	args := []interface{}{}
	i := 1
	for k, v := range fields {
		if i > 1 {
			q += ", "
		}
		q += fmt.Sprintf("%s=$%d", k, i)
		args = append(args, v)
		i++
	}
	q += fmt.Sprintf(" WHERE user_id=$%d", i)
	args = append(args, userID)
	_, err := r.db.Exec(ctx, q, args...)
	return err
}

func (r *AthleteRepository) ListApproved(ctx context.Context, sport, search, level string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	args := []interface{}{}
	where := "WHERE ap.verified = TRUE"
	i := 1

	if sport != "" {
		where += fmt.Sprintf(" AND ap.sport = $%d", i)
		args = append(args, sport)
		i++
	}
	if level != "" {
		where += fmt.Sprintf(" AND ap.level = $%d", i)
		args = append(args, level)
		i++
	}
	if search != "" {
		where += fmt.Sprintf(" AND (u.full_name ILIKE $%d OR ap.username ILIKE $%d)", i, i)
		args = append(args, "%"+search+"%")
		i++
	}

	// Count
	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM athlete_profiles ap JOIN users u ON ap.user_id = u.id `+where,
		countArgs...,
	).Scan(&total)

	// Data
	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT ap.id, u.full_name, ap.username, ap.sport, ap.location,
		       u.avatar_url, ap.total_votes, ap.global_rank, ap.tier, ap.verified
		FROM athlete_profiles ap
		JOIN users u ON ap.user_id = u.id
		%s
		ORDER BY ap.total_votes DESC
		LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var (
			id, username, sport, location, avatarURL string
			fullName                                   string
			totalVotes                                 int64
			globalRank                                 *int
			tier                                       string
			verified                                   bool
		)
		if err := rows.Scan(&id, &fullName, &username, &sport, &location, &avatarURL, &totalVotes, &globalRank, &tier, &verified); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"id": id, "full_name": fullName, "username": username,
			"sport": sport, "location": location, "avatar_url": avatarURL,
			"total_votes": totalVotes, "rank": globalRank, "tier": tier, "verified": verified,
		})
	}
	return result, total, nil
}

func (r *AthleteRepository) GetLeaderboard(ctx context.Context, sport string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE ap.verified = TRUE"
	args := []interface{}{}
	i := 1

	if sport != "" {
		where += fmt.Sprintf(" AND ap.sport = $%d", i)
		args = append(args, sport)
		i++
	}

	var total int
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM athlete_profiles ap `+where, args...,
	).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT ap.global_rank, ap.id, u.full_name, ap.username, ap.location, ap.sport,
		       ap.total_votes, ap.rank_movement, ap.rank_movement_value, ap.tier, u.avatar_url
		FROM athlete_profiles ap
		JOIN users u ON ap.user_id = u.id
		%s
		ORDER BY ap.global_rank ASC NULLS LAST
		LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var (
			rank                                      *int
			id, fullName, username, location, sport  string
			avatarURL                                  *string
			totalVotes                                 int64
			movement                                   string
			movementValue                              int
			tier                                       string
		)
		if err := rows.Scan(&rank, &id, &fullName, &username, &location, &sport,
			&totalVotes, &movement, &movementValue, &tier, &avatarURL); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"rank": rank, "athlete_id": id, "full_name": fullName, "handle": "@" + username,
			"location": location, "sport": sport, "total_votes": totalVotes,
			"movement": movement, "movement_value": movementValue, "tier": tier, "avatar_url": avatarURL,
		})
	}
	return result, total, nil
}

// ─── Votes ────────────────────────────────────────────────────

func (r *AthleteRepository) CastVote(ctx context.Context, fanID, athleteID uuid.UUID) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO votes (id, fan_id, athlete_id) VALUES ($1, $2, $3)`,
		uuid.New(), fanID, athleteID,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return ErrDuplicate
		}
		return err
	}
	// Increment vote counter
	_, err = r.db.Exec(ctx,
		`UPDATE athlete_profiles SET total_votes = total_votes + 1 WHERE id = $1`,
		athleteID,
	)
	return err
}

func (r *AthleteRepository) HasVotedToday(ctx context.Context, fanID, athleteID uuid.UUID) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM votes WHERE fan_id=$1 AND athlete_id=$2 AND DATE(voted_at) = CURRENT_DATE)`,
		fanID, athleteID,
	).Scan(&exists)
	return exists, err
}

func (r *AthleteRepository) GetTotalVotes(ctx context.Context, athleteID uuid.UUID) (int64, error) {
	var total int64
	err := r.db.QueryRow(ctx,
		`SELECT total_votes FROM athlete_profiles WHERE id = $1`, athleteID,
	).Scan(&total)
	return total, err
}

func (r *AthleteRepository) LastVoteTime(ctx context.Context, fanID, athleteID uuid.UUID) (*string, error) {
	var votedAt *string
	err := r.db.QueryRow(ctx,
		`SELECT voted_at::TEXT FROM votes WHERE fan_id=$1 AND athlete_id=$2 ORDER BY voted_at DESC LIMIT 1`,
		fanID, athleteID,
	).Scan(&votedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return votedAt, err
}

// ─── Media ────────────────────────────────────────────────────

func (r *AthleteRepository) AddMedia(ctx context.Context, athleteID uuid.UUID, mediaType, url string) (*models.AthleteMedia, error) {
	m := &models.AthleteMedia{ID: uuid.New(), AthleteID: athleteID, Type: mediaType, URL: url}
	err := r.db.QueryRow(ctx,
		`INSERT INTO athlete_media (id, athlete_id, type, url) VALUES ($1, $2, $3, $4) RETURNING created_at`,
		m.ID, m.AthleteID, m.Type, m.URL,
	).Scan(&m.CreatedAt)
	return m, err
}

func (r *AthleteRepository) ListMedia(ctx context.Context, athleteID uuid.UUID) ([]models.AthleteMedia, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, athlete_id, type, url, thumbnail_url, created_at FROM athlete_media WHERE athlete_id = $1 ORDER BY created_at DESC`,
		athleteID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.AthleteMedia
	for rows.Next() {
		var m models.AthleteMedia
		if err := rows.Scan(&m.ID, &m.AthleteID, &m.Type, &m.URL, &m.ThumbnailURL, &m.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, m)
	}
	return items, nil
}

func (r *AthleteRepository) DeleteMedia(ctx context.Context, mediaID, athleteID uuid.UUID) error {
	res, err := r.db.Exec(ctx,
		`DELETE FROM athlete_media WHERE id = $1 AND athlete_id = $2`,
		mediaID, athleteID,
	)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// ─── Earnings / Transactions ──────────────────────────────────

func (r *AthleteRepository) CreditBalance(ctx context.Context, athleteID uuid.UUID, amount float64, txType models.TransactionType, description string, opts ...uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`UPDATE athlete_profiles SET available_balance = available_balance + $1, lifetime_earned = lifetime_earned + $1 WHERE id = $2`,
		amount, athleteID,
	)
	if err != nil {
		return err
	}

	txID := uuid.New()
	_, err = tx.Exec(ctx,
		`INSERT INTO athlete_transactions (id, athlete_id, type, amount, description) VALUES ($1, $2, $3, $4, $5)`,
		txID, athleteID, txType, amount, description,
	)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *AthleteRepository) DistributeVoteIncome(ctx context.Context, athleteID uuid.UUID, amount float64, description, period string, adminID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx,
		`UPDATE athlete_profiles SET available_balance = available_balance + $1, lifetime_earned = lifetime_earned + $1 WHERE id = $2`,
		amount, athleteID,
	)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO athlete_transactions (id, athlete_id, type, amount, description, distributed_by, period)
		 VALUES ($1, $2, 'vote_income', $3, $4, $5, $6)`,
		uuid.New(), athleteID, amount, description, adminID, period,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return ErrDuplicate
		}
		return err
	}
	return tx.Commit(ctx)
}

func (r *AthleteRepository) ListTransactions(ctx context.Context, athleteID uuid.UUID, page, perPage int) ([]models.AthleteTransaction, int, error) {
	offset := (page - 1) * perPage
	var total int
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM athlete_transactions WHERE athlete_id = $1`, athleteID,
	).Scan(&total)

	rows, err := r.db.Query(ctx,
		`SELECT id, athlete_id, type, amount, description, order_id, referred_user_id, distributed_by, period, created_at
		 FROM athlete_transactions WHERE athlete_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
		athleteID, perPage, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var txs []models.AthleteTransaction
	for rows.Next() {
		var t models.AthleteTransaction
		if err := rows.Scan(&t.ID, &t.AthleteID, &t.Type, &t.Amount, &t.Description,
			&t.OrderID, &t.ReferredUserID, &t.DistributedBy, &t.Period, &t.CreatedAt); err != nil {
			return nil, 0, err
		}
		txs = append(txs, t)
	}
	return txs, total, nil
}

func (r *AthleteRepository) GetBalance(ctx context.Context, athleteID uuid.UUID) (float64, float64, float64, error) {
	var available, lifetime, pending float64
	err := r.db.QueryRow(ctx,
		`SELECT available_balance, lifetime_earned, pending_balance FROM athlete_profiles WHERE id = $1`,
		athleteID,
	).Scan(&available, &lifetime, &pending)
	return available, lifetime, pending, err
}

func (r *AthleteRepository) DeductBalance(ctx context.Context, athleteID uuid.UUID, amount float64) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles SET available_balance = available_balance - $1 WHERE id = $2 AND available_balance >= $1`,
		amount, athleteID,
	)
	return err
}

// ─── Admin-facing ─────────────────────────────────────────────

func (r *AthleteRepository) ListForAdmin(ctx context.Context, search, sport, verificationStatus string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE 1=1"
	args := []interface{}{}
	i := 1

	if search != "" {
		where += fmt.Sprintf(" AND (u.full_name ILIKE $%d OR u.email ILIKE $%d)", i, i)
		args = append(args, "%"+search+"%")
		i++
	}
	if sport != "" {
		where += fmt.Sprintf(" AND ap.sport = $%d", i)
		args = append(args, sport)
		i++
	}
	if verificationStatus != "" {
		where += fmt.Sprintf(" AND ap.verification_status = $%d", i)
		args = append(args, verificationStatus)
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM athlete_profiles ap JOIN users u ON ap.user_id = u.id `+where, cArgs...,
	).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT ap.id, u.full_name, ap.sport, ap.total_votes, ap.available_balance,
		       ap.lifetime_earned, ap.verification_status
		FROM athlete_profiles ap
		JOIN users u ON ap.user_id = u.id
		%s ORDER BY ap.total_votes DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var (
			id, fullName, sport, verStatus string
			totalVotes                      int64
			available, lifetime            float64
		)
		if err := rows.Scan(&id, &fullName, &sport, &totalVotes, &available, &lifetime, &verStatus); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"id": id, "full_name": fullName, "sport": sport, "total_votes": totalVotes,
			"available_balance": available, "lifetime_earned": lifetime,
			"verification_status": verStatus,
		})
	}
	return result, total, nil
}

func (r *AthleteRepository) ListVerifications(ctx context.Context, status, search string, page, perPage int) ([]map[string]interface{}, int, error) {
	offset := (page - 1) * perPage
	where := "WHERE 1=1"
	args := []interface{}{}
	i := 1

	if status != "" {
		where += fmt.Sprintf(" AND ap.verification_status = $%d", i)
		args = append(args, status)
		i++
	}
	if search != "" {
		where += fmt.Sprintf(" AND u.full_name ILIKE $%d", i)
		args = append(args, "%"+search+"%")
		i++
	}

	var total int
	cArgs := make([]interface{}, len(args))
	copy(cArgs, args)
	_ = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM athlete_profiles ap JOIN users u ON ap.user_id = u.id `+where, cArgs...,
	).Scan(&total)

	args = append(args, perPage, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT ap.id, ap.user_id, u.full_name, ap.location, ap.sport, ap.id_document_url,
		       u.avatar_url, ap.verification_status, ap.created_at
		FROM athlete_profiles ap
		JOIN users u ON ap.user_id = u.id
		%s ORDER BY ap.created_at DESC LIMIT $%d OFFSET $%d`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var (
			id, userID, fullName, sport, verStatus string
			location, docURL, avatarURL            *string
			createdAt                              interface{}
		)
		if err := rows.Scan(&id, &userID, &fullName, &location, &sport, &docURL, &avatarURL, &verStatus, &createdAt); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"verification_id": id, "athlete_id": userID, "full_name": fullName,
			"location": location, "sport": sport, "id_document_url": docURL,
			"avatar_url": avatarURL, "status": verStatus, "submitted_at": createdAt,
		})
	}
	return result, total, nil
}

func (r *AthleteRepository) ApproveVerification(ctx context.Context, athleteProfileID uuid.UUID, notes string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles SET verification_status='approved', verified=TRUE, verified_at=NOW(), reviewer_notes=$1 WHERE id=$2`,
		notes, athleteProfileID,
	)
	return err
}

func (r *AthleteRepository) RejectVerification(ctx context.Context, athleteProfileID uuid.UUID, notes string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE athlete_profiles SET verification_status='rejected', reviewer_notes=$1 WHERE id=$2`,
		notes, athleteProfileID,
	)
	return err
}

func (r *AthleteRepository) IncrementProfileViews(ctx context.Context, athleteID uuid.UUID) {
	_, _ = r.db.Exec(ctx,
		`UPDATE athlete_profiles SET total_profile_views = total_profile_views + 1 WHERE id = $1`,
		athleteID,
	)
}

// ─── Referral ──────────────────────────────────────────────────



func (r *AthleteRepository) UpdateReferralCode(ctx context.Context, athleteID uuid.UUID, code string) error {
	_, err := r.db.Exec(ctx, `UPDATE athlete_profiles SET referral_code = $1 WHERE id = $2`, code, athleteID)
	return err
}

func (r *AthleteRepository) AddReferralEarnings(ctx context.Context, athleteID uuid.UUID, amount float64) error {
	_, err := r.db.Exec(ctx, `
		UPDATE athlete_profiles 
		SET available_balance = available_balance + $1,
		    lifetime_earned = lifetime_earned + $1
		WHERE id = $2`, amount, athleteID)
	return err
}

// ─── Leaderboard update (called by Asynq worker) ─────────────

func (r *AthleteRepository) UpdateRanksFromVotes(ctx context.Context) error {
	_, err := r.db.Exec(ctx, `
		WITH ranked AS (
			SELECT id, ROW_NUMBER() OVER (ORDER BY total_votes DESC) AS new_rank
			FROM athlete_profiles WHERE verified = TRUE
		)
		UPDATE athlete_profiles ap
		SET global_rank = r.new_rank,
		    tier = (CASE WHEN r.new_rank <= 10 THEN 'ELITE' WHEN r.new_rank <= 50 THEN 'RISING' ELSE 'ROOKIE' END)::athlete_tier
		FROM ranked r WHERE ap.id = r.id
	`)
	return err
}

// isUniqueViolation detects PostgreSQL unique constraint violations (error code 23505).
func isUniqueViolation(err error) bool {
	return err != nil && (fmt.Sprintf("%v", err) == "ERROR: duplicate key value violates unique constraint" ||
		contains(err.Error(), "23505") || contains(err.Error(), "unique"))
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(s) > 0 && containsStr(s, sub))
}

func containsStr(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

func (r *AthleteRepository) UpdateStripeConnectAccountID(ctx context.Context, athleteID uuid.UUID, accountID string) error {
	_, err := r.db.Exec(ctx, `UPDATE athlete_profiles SET stripe_connect_account_id = $1 WHERE id = $2`, accountID, athleteID)
	return err
}

func (r *AthleteRepository) RequestWithdrawal(ctx context.Context, athleteID uuid.UUID, amount float64, bankAccountID *string) (uuid.UUID, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	defer tx.Rollback(ctx)

	// 1. Deduct available balance and add to pending
	res, err := tx.Exec(ctx, `
		UPDATE athlete_profiles 
		SET available_balance = available_balance - $1,
		    pending_balance = pending_balance + $1
		WHERE id = $2 AND available_balance >= $1
	`, amount, athleteID)
	
	if err != nil {
		return uuid.Nil, err
	}
	if res.RowsAffected() == 0 {
		return uuid.Nil, fmt.Errorf("INSUFFICIENT_FUNDS")
	}

	// 2. Create withdrawal record
	var withdrawalID uuid.UUID
	err = tx.QueryRow(ctx, `
		INSERT INTO withdrawals (athlete_id, amount, bank_account_id, status)
		VALUES ($1, $2, $3, 'processing')
		RETURNING id
	`, athleteID, amount, bankAccountID).Scan(&withdrawalID)
	if err != nil {
		return uuid.Nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return uuid.Nil, err
	}

	return withdrawalID, nil
}

func (r *AthleteRepository) CompleteWithdrawal(ctx context.Context, withdrawalID uuid.UUID, athleteID uuid.UUID, amount float64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Update withdrawal status
	_, err = tx.Exec(ctx, `UPDATE withdrawals SET status = 'completed' WHERE id = $1`, withdrawalID)
	if err != nil {
		return err
	}

	// 2. Decrement pending balance
	_, err = tx.Exec(ctx, `
		UPDATE athlete_profiles 
		SET pending_balance = pending_balance - $1 
		WHERE id = $2
	`, amount, athleteID)
	if err != nil {
		return err
	}

	// 3. Log transaction
	_, err = tx.Exec(ctx, `
		INSERT INTO athlete_transactions (athlete_id, type, amount, description)
		VALUES ($1, 'withdrawal', $2, 'Payout to connected bank account')
	`, athleteID, amount)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}
