// Package tasks defines all Asynq background task types and their payload structs.
// Asynq is a Redis-backed async task queue — the Go equivalent of Celery.
package tasks

import "github.com/google/uuid"

// Task type constants — used as queue identifiers.
const (
	// Email tasks
	TypeEmailPasswordReset        = "email:password_reset"
	TypeEmailOrderConfirmation    = "email:order_confirmation"
	TypeEmailVerificationApproved = "email:verification_approved"
	TypeEmailVerificationRejected = "email:verification_rejected"
	TypeEmailAdminOTP             = "email:admin_otp"

	// Referral tasks
	TypeReferralSignupCredit = "referral:signup_credit"
	TypeReferralTipCredit    = "referral:tip_credit"

	// Leaderboard tasks
	TypeLeaderboardRefresh = "leaderboard:refresh"
)

// ─── Email Payloads ───────────────────────────────────────────

type PasswordResetPayload struct {
	Email     string `json:"email"`
	FullName  string `json:"full_name"`
	ResetLink string `json:"reset_link"`
}

type OrderConfirmationPayload struct {
	Email       string  `json:"email"`
	FullName    string  `json:"full_name"`
	OrderNumber string  `json:"order_number"`
	Total       float64 `json:"total"`
}

type VerificationApprovedPayload struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
}

type VerificationRejectedPayload struct {
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Notes    string `json:"notes"`
}

type AdminOTPPayload struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// ─── Referral Payloads ────────────────────────────────────────

// ReferralSignupCreditPayload is enqueued when a new user registers with a referral code.
type ReferralSignupCreditPayload struct {
	ReferrerAthleteProfileID uuid.UUID `json:"referrer_athlete_profile_id"`
	NewUserID                uuid.UUID `json:"new_user_id"`
	Amount                   float64   `json:"amount"`
}

// ReferralTipCreditPayload is enqueued when a referred fan completes a purchase.
type ReferralTipCreditPayload struct {
	ReferrerAthleteProfileID uuid.UUID `json:"referrer_athlete_profile_id"`
	OrderID                  uuid.UUID `json:"order_id"`
	OrderTotal               float64   `json:"order_total"`
	TipPercentage            float64   `json:"tip_percentage"`
}

// ─── Leaderboard Payloads ─────────────────────────────────────

// LeaderboardRefreshPayload has no fields — triggered on a schedule.
type LeaderboardRefreshPayload struct{}
