package tasks

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/models"
	"github.com/uag/backend/internal/repository"
	"go.uber.org/zap"
)

// ReferralHandler processes referral credit background tasks.
type ReferralHandler struct {
	athleteRepo *repository.AthleteRepository
	userRepo    *repository.UserRepository
	log         *zap.Logger
}

func NewReferralHandler(athleteRepo *repository.AthleteRepository, userRepo *repository.UserRepository, log *zap.Logger) *ReferralHandler {
	return &ReferralHandler{athleteRepo: athleteRepo, userRepo: userRepo, log: log}
}

// ─── PRODUCERS ────────────────────────────────────────────────

// NewReferralSignupCreditTask enqueues a task to credit the referrer on signup.
func NewReferralSignupCreditTask(payload ReferralSignupCreditPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeReferralSignupCredit, data), nil
}

// NewReferralTipCreditTask enqueues a task to credit the referrer a % of an order.
func NewReferralTipCreditTask(payload ReferralTipCreditPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeReferralTipCredit, data), nil
}

// ─── CONSUMERS ────────────────────────────────────────────────

// HandleSignupCredit processes a referral signup credit task.
// Credits $0.50 to the referring athlete and creates a referral_link record.
func (h *ReferralHandler) HandleSignupCredit(ctx context.Context, t *asynq.Task) error {
	var p ReferralSignupCreditPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	description := fmt.Sprintf("Referral signup credit — new user %s", p.NewUserID)
	if err := h.athleteRepo.CreditBalance(ctx, p.ReferrerAthleteProfileID, p.Amount, models.TxReferralSignup, description); err != nil {
		h.log.Error("failed to credit referral signup", zap.Error(err))
		return err
	}

	// Record referral link for lifetime tip tracking
	if err := h.userRepo.CreateReferralLink(ctx, p.NewUserID, p.ReferrerAthleteProfileID); err != nil {
		h.log.Warn("failed to create referral link", zap.Error(err))
		// Non-fatal — credit already applied
	}

	h.log.Info("referral signup credited",
		zap.String("referrer", p.ReferrerAthleteProfileID.String()),
		zap.Float64("amount", p.Amount),
	)
	return nil
}

// HandleTipCredit processes a referral tip task.
// Credits tip_percentage of the order total to the referring athlete.
func (h *ReferralHandler) HandleTipCredit(ctx context.Context, t *asynq.Task) error {
	var p ReferralTipCreditPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	tipAmount := p.OrderTotal * p.TipPercentage
	description := fmt.Sprintf("10%% referral tip — order %s ($%.2f)", p.OrderID, p.OrderTotal)

	if err := h.athleteRepo.CreditBalance(ctx, p.ReferrerAthleteProfileID, tipAmount, models.TxReferralTip, description); err != nil {
		h.log.Error("failed to credit referral tip", zap.Error(err))
		return err
	}

	h.log.Info("referral tip credited",
		zap.String("referrer", p.ReferrerAthleteProfileID.String()),
		zap.Float64("tip", tipAmount),
		zap.String("order", p.OrderID.String()),
	)
	return nil
}
