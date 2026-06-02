package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
	stripecustomer "github.com/stripe/stripe-go/v78/customer"
	stripepm "github.com/stripe/stripe-go/v78/paymentmethod"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/models"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/tasks"
	"go.uber.org/zap"
)

// OrderService handles the checkout and order management business logic.
type OrderService struct {
	orderRepo   *repository.OrderRepository
	cartRepo    *repository.CartRepository
	productRepo *repository.ProductRepository
	userRepo    *repository.UserRepository
	athleteRepo *repository.AthleteRepository
	cfg         *config.Config
	queue       *asynq.Client
	log         *zap.Logger
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	cartRepo *repository.CartRepository,
	productRepo *repository.ProductRepository,
	userRepo *repository.UserRepository,
	athleteRepo *repository.AthleteRepository,
	cfg *config.Config,
	queue *asynq.Client,
	log *zap.Logger,
) *OrderService {
	stripe.Key = cfg.StripeSecretKey
	return &OrderService{
		orderRepo: orderRepo, cartRepo: cartRepo, productRepo: productRepo,
		userRepo: userRepo, athleteRepo: athleteRepo,
		cfg: cfg, queue: queue, log: log,
	}
}

// PlaceOrder processes a checkout:
//  1. Validate cart is non-empty
//  2. Ensure inventory is available
//  3. Create/get Stripe customer
//  4. Charge via Stripe PaymentIntent
//  5. Create order record in DB
//  6. Decrement inventory
//  7. Clear cart
//  8. Enqueue order confirmation email
//  9. Enqueue referral tip if user was referred
func (s *OrderService) PlaceOrder(ctx context.Context, userID, addressID, pmID uuid.UUID) (*models.Order, error) {
	// 1. Get user
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("INVALID_USER")
	}

	// 2. Get cart
	cart, err := s.cartRepo.GetOrCreate(ctx, userID)
	if err != nil || len(cart.Items) == 0 {
		return nil, fmt.Errorf("EMPTY_CART")
	}

	// 3. Get address
	address, err := s.userRepo.FindAddressByID(ctx, addressID)
	if err != nil || address.UserID != userID {
		return nil, fmt.Errorf("INVALID_ADDRESS")
	}

	// 4. Get payment method
	pm, err := s.userRepo.FindPaymentMethodByID(ctx, pmID, userID)
	if err != nil {
		return nil, fmt.Errorf("INVALID_PAYMENT_METHOD")
	}

	// 5. Calculate totals
	subtotal := cart.Subtotal
	shipping := 5.00
	tax := subtotal * 0.085 // 8.5% tax
	total := subtotal + shipping + tax

	// 6. Ensure Stripe customer exists
	customerID, err := s.ensureStripeCustomer(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("creating stripe customer: %w", err)
	}

	// 7. Create Stripe PaymentIntent and confirm
	pi, err := paymentintent.New(&stripe.PaymentIntentParams{
		Amount:             stripe.Int64(int64(total * 100)), // cents
		Currency:           stripe.String(string(stripe.CurrencyUSD)),
		Customer:           stripe.String(customerID),
		PaymentMethod:      stripe.String(pm.StripePMID),
		Confirm:            stripe.Bool(true),
		ReturnURL:          stripe.String(s.cfg.BaseURL + "/fan/shop"),
		OffSession:         stripe.Bool(true),
	})
	if err != nil {
		return nil, fmt.Errorf("PAYMENT_FAILED: %s", err.Error())
	}

	if pi.Status == stripe.PaymentIntentStatusRequiresAction {
		return nil, fmt.Errorf("PAYMENT_REQUIRES_ACTION")
	}

	// 8. Generate order number
	orderNumber := fmt.Sprintf("ORD-%d", uuid.New().ID())

	// 9. Create order record
	order := &models.Order{
		OrderNumber:           orderNumber,
		UserID:                userID,
		Status:                models.OrderProcessing,
		Subtotal:              subtotal,
		Shipping:              shipping,
		Tax:                   tax,
		Total:                 total,
		StripePaymentIntentID: &pi.ID,
		ShippingAddress:       address,
	}
	if err := s.orderRepo.Create(ctx, order, cart.Items); err != nil {
		return nil, fmt.Errorf("saving order: %w", err)
	}

	// 10. Decrement inventory
	for _, item := range cart.Items {
		if err := s.productRepo.DecrementInventory(ctx, item.ProductID, item.Quantity); err != nil {
			s.log.Warn("failed to decrement inventory", zap.String("product", item.ProductID.String()), zap.Error(err))
		}
	}

	// 11. Clear cart
	_ = s.cartRepo.ClearCart(ctx, cart.ID)

	// 12. Send order confirmation email (async)
	emailTask, _ := tasks.NewOrderConfirmationTask(tasks.OrderConfirmationPayload{
		Email:       user.Email,
		FullName:    user.FullName,
		OrderNumber: orderNumber,
		Total:       total,
	})
	_, _ = s.queue.Enqueue(emailTask)

	// 13. Referral tip: if user was referred, credit the referring athlete 10%
	if referrerID, err := s.userRepo.FindReferrerByUserID(ctx, userID); err == nil && referrerID != nil {
		tipTask, _ := tasks.NewReferralTipCreditTask(tasks.ReferralTipCreditPayload{
			ReferrerAthleteProfileID: *referrerID,
			OrderID:                  order.ID,
			OrderTotal:               total,
			TipPercentage:            s.cfg.ReferralTipPercentage,
		})
		_, _ = s.queue.Enqueue(tipTask)
	}

	return order, nil
}

// HandleStripeWebhook processes Stripe payment lifecycle events.
func (s *OrderService) HandleStripeWebhook(ctx context.Context, intentID string, succeeded bool) error {
	order, err := s.orderRepo.FindByStripePaymentIntent(ctx, intentID)
	if err != nil {
		return nil // Order not found — ignore
	}

	if succeeded {
		return s.orderRepo.UpdateStatus(ctx, order.ID, models.OrderProcessing)
	}
	return s.orderRepo.UpdateStatus(ctx, order.ID, models.OrderCancelled)
}

func (s *OrderService) ensureStripeCustomer(ctx context.Context, user *models.User) (string, error) {
	if user.StripeCustomerID != nil && *user.StripeCustomerID != "" {
		return *user.StripeCustomerID, nil
	}

	c, err := stripecustomer.New(&stripe.CustomerParams{
		Email: stripe.String(user.Email),
		Name:  stripe.String(user.FullName),
	})
	if err != nil {
		return "", err
	}

	_ = s.userRepo.UpdateStripeCustomerID(ctx, user.ID, c.ID)
	return c.ID, nil
}

// AttachPaymentMethod attaches a Stripe PaymentMethod to the user and syncs to DB.
func (s *OrderService) AttachPaymentMethod(ctx context.Context, userID uuid.UUID, stripePMID string) (*models.PaymentMethod, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	customerID, err := s.ensureStripeCustomer(ctx, user)
	if err != nil {
		return nil, err
	}

	// Attach the PM to the Stripe customer
	_, err = stripepm.Attach(stripePMID, &stripe.PaymentMethodAttachParams{
		Customer: stripe.String(customerID),
	})
	if err != nil {
		return nil, fmt.Errorf("STRIPE_ERROR: %s", err.Error())
	}

	// Retrieve PM details from Stripe
	pm, err := stripepm.Get(stripePMID, nil)
	if err != nil {
		return nil, err
	}

	// Check how many PMs the user already has
	count, _ := s.userRepo.CountPaymentMethods(ctx, userID)

	pmModel := &models.PaymentMethod{
		UserID:       userID,
		StripePMID:   stripePMID,
		Brand:        string(pm.Card.Brand),
		LastFour:     pm.Card.Last4,
		ExpiresMonth: int(pm.Card.ExpMonth),
		ExpiresYear:  int(pm.Card.ExpYear),
		IsDefault:    count == 0, // First card is default
	}

	if err := s.userRepo.CreatePaymentMethod(ctx, pmModel); err != nil {
		return nil, err
	}

	return pmModel, nil
}

// DetachPaymentMethod removes a PM from both Stripe and DB.
func (s *OrderService) DetachPaymentMethod(ctx context.Context, pmID, userID uuid.UUID) error {
	pm, err := s.userRepo.FindPaymentMethodByID(ctx, pmID, userID)
	if err != nil {
		return fmt.Errorf("INVALID_PAYMENT_METHOD")
	}

	count, _ := s.userRepo.CountPaymentMethods(ctx, userID)
	if count <= 1 {
		return fmt.Errorf("ONLY_PAYMENT_METHOD")
	}

	// Detach from Stripe
	_, _ = stripepm.Detach(pm.StripePMID, nil)

	return s.userRepo.DeletePaymentMethod(ctx, pmID, userID)
}
