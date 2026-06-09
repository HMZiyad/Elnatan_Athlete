package tasks

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/transfer"
	"github.com/uag/backend/internal/repository"
)

const (
	TypeProcessWithdrawal = "stripe:process_withdrawal"
)

type ProcessWithdrawalPayload struct {
	WithdrawalID           uuid.UUID `json:"withdrawal_id"`
	AthleteID              uuid.UUID `json:"athlete_id"`
	StripeConnectAccountID string    `json:"stripe_connect_account_id"`
	Amount                 float64   `json:"amount"`
}

func NewProcessWithdrawalTask(payload ProcessWithdrawalPayload) (*asynq.Task, error) {
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeProcessWithdrawal, b), nil
}

type StripeTaskProcessor struct {
	athleteRepo     *repository.AthleteRepository
	stripeSecretKey string
}

func NewStripeTaskProcessor(athleteRepo *repository.AthleteRepository, stripeSecretKey string) *StripeTaskProcessor {
	return &StripeTaskProcessor{
		athleteRepo:     athleteRepo,
		stripeSecretKey: stripeSecretKey,
	}
}

func (p *StripeTaskProcessor) HandleProcessWithdrawalTask(ctx context.Context, t *asynq.Task) error {
	var payload ProcessWithdrawalPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("json.Unmarshal failed: %v", err)
	}

	stripe.Key = p.stripeSecretKey

	// Transfer funds to athlete's connected account
	transferParams := &stripe.TransferParams{
		Amount:      stripe.Int64(int64(payload.Amount * 100)), // Convert to cents
		Currency:    stripe.String(string(stripe.CurrencyUSD)),
		Destination: stripe.String(payload.StripeConnectAccountID),
		Description: stripe.String(fmt.Sprintf("Withdrawal %s", payload.WithdrawalID.String())),
	}
	
	_, err := transfer.New(transferParams)
	if err != nil {
		return fmt.Errorf("Stripe transfer failed: %w", err)
	}

	// Update DB to mark withdrawal as complete
	if err := p.athleteRepo.CompleteWithdrawal(ctx, payload.WithdrawalID, payload.AthleteID, payload.Amount); err != nil {
		return fmt.Errorf("Completing withdrawal in DB failed: %w", err)
	}

	return nil
}
