package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/models"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/tasks"
	"github.com/uag/backend/internal/utils"
)

// AuthService handles user and admin authentication business logic.
type AuthService struct {
	userRepo    *repository.UserRepository
	athleteRepo *repository.AthleteRepository
	cfg         *config.Config
	queue       *asynq.Client
}

func NewAuthService(userRepo *repository.UserRepository, athleteRepo *repository.AthleteRepository, cfg *config.Config, queue *asynq.Client) *AuthService {
	return &AuthService{userRepo: userRepo, athleteRepo: athleteRepo, cfg: cfg, queue: queue}
}

// Register creates a new user account. If a referral code is provided and valid,
// a background task is enqueued to credit the referrer.
func (s *AuthService) Register(ctx context.Context, fullName, email, password, role, referralCode string) (*models.User, string, time.Time, error) {
	// Check duplicate email
	exists, err := s.userRepo.EmailExists(ctx, email)
	if err != nil {
		return nil, "", time.Time{}, err
	}
	if exists {
		return nil, "", time.Time{}, fmt.Errorf("EMAIL_ALREADY_EXISTS")
	}

	hash, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	user := &models.User{
		FullName:     fullName,
		Email:        email,
		PasswordHash: hash,
		Role:         models.UserRole(role),
	}

	// Resolve referral code
	var referrerProfile *models.AthleteProfile
	if referralCode != "" {
		referrerProfile, err = s.athleteRepo.FindByReferralCode(ctx, referralCode)
		if err == nil {
			// Store who referred this user
			user.ReferredBy = &referrerProfile.UserID
		}
		// Silently ignore invalid referral codes
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", time.Time{}, fmt.Errorf("creating user: %w", err)
	}

	// Create athlete profile stub (will be filled via onboarding)
	if role == string(models.RoleAthlete) {
		_, _ = s.athleteRepo.Create(ctx, user.ID)
	}

	// Enqueue referral credit task (async, non-blocking)
	if referrerProfile != nil {
		task, _ := tasks.NewReferralSignupCreditTask(tasks.ReferralSignupCreditPayload{
			ReferrerAthleteProfileID: referrerProfile.ID,
			NewUserID:                user.ID,
			Amount:                   s.cfg.ReferralSignupCredit,
		})
		_ = s.enqueue(task)
	}

	// Generate JWT
	token, expiresAt, err := utils.GenerateToken(user.ID, role, s.cfg.JWTSecret, s.cfg.JWTExpiryHours)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	return user, token, expiresAt, nil
}

// Login authenticates a user and returns a JWT.
func (s *AuthService) Login(ctx context.Context, email, password, role string) (*models.User, string, time.Time, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", time.Time{}, fmt.Errorf("INVALID_CREDENTIALS")
	}

	if string(user.Role) != role {
		return nil, "", time.Time{}, fmt.Errorf("WRONG_ROLE")
	}

	if !utils.CheckPassword(password, user.PasswordHash) {
		return nil, "", time.Time{}, fmt.Errorf("INVALID_CREDENTIALS")
	}

	token, expiresAt, err := utils.GenerateToken(user.ID, string(user.Role), s.cfg.JWTSecret, s.cfg.JWTExpiryHours)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	return user, token, expiresAt, nil
}

// ForgotPassword generates a reset token and enqueues a password reset email.
func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		// Do not reveal whether the email exists
		return nil
	}

	// Generate a random token
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return err
	}
	rawToken := hex.EncodeToString(b)
	hash := sha256Hash(rawToken)
	expiresAt := time.Now().Add(1 * time.Hour)

	if err := s.userRepo.SaveResetToken(ctx, user.ID, hash, expiresAt); err != nil {
		return err
	}

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.cfg.BaseURL, rawToken)

	task, _ := tasks.NewPasswordResetEmailTask(tasks.PasswordResetPayload{
		Email:     user.Email,
		FullName:  user.FullName,
		ResetLink: resetLink,
	})
	return s.enqueue(task)
}

// ResetPassword validates the reset token and updates the password.
func (s *AuthService) ResetPassword(ctx context.Context, rawToken, newPassword string) error {
	hash := sha256Hash(rawToken)
	userID, err := s.userRepo.FindValidResetToken(ctx, hash)
	if err != nil {
		return fmt.Errorf("INVALID_RESET_TOKEN")
	}

	passwordHash, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePassword(ctx, userID, passwordHash); err != nil {
		return err
	}

	return s.userRepo.MarkResetTokenUsed(ctx, hash)
}

// GetMe returns the current user by ID.
func (s *AuthService) GetMe(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(ctx, userID)
}

// ─── Helpers ──────────────────────────────────────────────────

func (s *AuthService) enqueue(task *asynq.Task) error {
	_, err := s.queue.Enqueue(task)
	return err
}

func sha256Hash(s string) string {
	h := sha256.Sum256([]byte(s))
	return hex.EncodeToString(h[:])
}

// GenerateReferralCode creates a deterministic referral code from the athlete's username.
func GenerateReferralCode(username string) string {
	clean := strings.ToUpper(strings.ReplaceAll(username, " ", ""))
	return "UAG-" + clean
}
