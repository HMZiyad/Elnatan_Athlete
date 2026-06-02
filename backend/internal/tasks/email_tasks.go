package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"net/smtp"

	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/config"
	"go.uber.org/zap"
)

// EmailHandler processes all email background tasks.
type EmailHandler struct {
	cfg *config.Config
	log *zap.Logger
}

func NewEmailHandler(cfg *config.Config, log *zap.Logger) *EmailHandler {
	return &EmailHandler{cfg: cfg, log: log}
}

// ─── PRODUCERS (used by services to enqueue tasks) ────────────

// NewPasswordResetEmailTask enqueues a password reset email.
func NewPasswordResetEmailTask(payload PasswordResetPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeEmailPasswordReset, data), nil
}

// NewOrderConfirmationTask enqueues an order confirmation email.
func NewOrderConfirmationTask(payload OrderConfirmationPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeEmailOrderConfirmation, data), nil
}

// NewVerificationApprovedTask enqueues a verification approval email.
func NewVerificationApprovedTask(payload VerificationApprovedPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeEmailVerificationApproved, data), nil
}

// NewVerificationRejectedTask enqueues a verification rejection email.
func NewVerificationRejectedTask(payload VerificationRejectedPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeEmailVerificationRejected, data), nil
}

// NewAdminOTPTask enqueues an OTP code email for admin.
func NewAdminOTPTask(payload AdminOTPPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeEmailAdminOTP, data), nil
}

// ─── CONSUMERS (executed by the Asynq worker process) ─────────

// HandlePasswordReset processes a password reset email task.
func (h *EmailHandler) HandlePasswordReset(ctx context.Context, t *asynq.Task) error {
	var p PasswordResetPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	subject := "Reset Your UAG Password"
	body := fmt.Sprintf(`Hi %s,

Click the link below to reset your password. This link expires in 1 hour.

%s

If you didn't request this, ignore this email.

— The UAG Team`, p.FullName, p.ResetLink)

	if err := h.sendEmail(p.Email, subject, body); err != nil {
		h.log.Error("failed to send password reset email", zap.String("email", p.Email), zap.Error(err))
		return err
	}

	h.log.Info("password reset email sent", zap.String("email", p.Email))
	return nil
}

// HandleOrderConfirmation processes an order confirmation email task.
func (h *EmailHandler) HandleOrderConfirmation(ctx context.Context, t *asynq.Task) error {
	var p OrderConfirmationPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	subject := fmt.Sprintf("Order Confirmed — %s", p.OrderNumber)
	body := fmt.Sprintf(`Hi %s,

Your order %s has been confirmed! Total: $%.2f

We'll send you another email when your order ships.

— The UAG Team`, p.FullName, p.OrderNumber, p.Total)

	return h.sendEmail(p.Email, subject, body)
}

// HandleVerificationApproved sends approval notification to athlete.
func (h *EmailHandler) HandleVerificationApproved(ctx context.Context, t *asynq.Task) error {
	var p VerificationApprovedPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	subject := "🎉 Your UAG Profile is Approved!"
	body := fmt.Sprintf(`Hi %s,

Great news — your ID has been verified and your athlete profile is now live on UAG!

Fans can now discover you, vote for you, and you can start earning.

Head to your dashboard to share your referral link.

— The UAG Team`, p.FullName)

	return h.sendEmail(p.Email, subject, body)
}

// HandleVerificationRejected sends rejection notification to athlete.
func (h *EmailHandler) HandleVerificationRejected(ctx context.Context, t *asynq.Task) error {
	var p VerificationRejectedPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	subject := "UAG — ID Verification Update"
	body := fmt.Sprintf(`Hi %s,

Unfortunately, your ID verification was not approved at this time.

Reason: %s

Please resubmit a valid, government-issued ID document from your dashboard.

— The UAG Team`, p.FullName, p.Notes)

	return h.sendEmail(p.Email, subject, body)
}

// HandleAdminOTP sends an OTP code to an admin.
func (h *EmailHandler) HandleAdminOTP(ctx context.Context, t *asynq.Task) error {
	var p AdminOTPPayload
	if err := json.Unmarshal(t.Payload(), &p); err != nil {
		return fmt.Errorf("decoding payload: %w", err)
	}

	subject := "Your UAG Admin Reset Code"
	body := fmt.Sprintf(`Your one-time password reset code is:

%s

This code expires in 10 minutes. Do not share it with anyone.

— The UAG Team`, p.Code)

	return h.sendEmail(p.Email, subject, body)
}

// ─── SMTP Helper ──────────────────────────────────────────────

func (h *EmailHandler) sendEmail(to, subject, body string) error {
	if h.cfg.SMTPHost == "" {
		// In dev/test, just log the email instead of sending
		h.log.Info("email (not sent — SMTP not configured)",
			zap.String("to", to),
			zap.String("subject", subject),
			zap.String("body", body),
		)
		return nil
	}

	auth := smtp.PlainAuth("", h.cfg.SMTPUser, h.cfg.SMTPPass, h.cfg.SMTPHost)
	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s",
		h.cfg.EmailFrom, to, subject, body)

	addr := fmt.Sprintf("%s:%d", h.cfg.SMTPHost, h.cfg.SMTPPort)
	return smtp.SendMail(addr, auth, h.cfg.EmailFrom, []string{to}, []byte(msg))
}
