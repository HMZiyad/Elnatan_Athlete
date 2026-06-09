package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/models"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/tasks"
	"github.com/uag/backend/internal/utils"
)

var _ = strconv.Itoa // ensure strconv used

// AdminHandler handles all super admin endpoints.
type AdminHandler struct {
	adminRepo   *repository.AdminRepository
	athleteRepo *repository.AthleteRepository
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
	userRepo    *repository.UserRepository
	cfg         *config.Config
	queue       *asynq.Client
}

func NewAdminHandler(
	adminRepo *repository.AdminRepository,
	athleteRepo *repository.AthleteRepository,
	orderRepo *repository.OrderRepository,
	productRepo *repository.ProductRepository,
	userRepo *repository.UserRepository,
	cfg *config.Config,
	queue *asynq.Client,
) *AdminHandler {
	return &AdminHandler{adminRepo: adminRepo, athleteRepo: athleteRepo, orderRepo: orderRepo,
		productRepo: productRepo, userRepo: userRepo, cfg: cfg, queue: queue}
}

// ─── Admin Auth ───────────────────────────────────────────────

func (h *AdminHandler) Signup(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email           string `json:"email" validate:"required,email"`
		Password        string `json:"password" validate:"required,min=8"`
		ConfirmPassword string `json:"confirm_password" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}
	if req.Password != req.ConfirmPassword {
		utils.BadRequest(w, "PASSWORDS_DO_NOT_MATCH", "Passwords do not match")
		return
	}

	// Check if admin already exists (first admin doesn't need a token, but middleware handles that)
	exists, _ := h.adminRepo.EmailExists(r.Context(), req.Email)
	if exists {
		utils.Conflict(w, "EMAIL_ALREADY_EXISTS", "An admin account with this email already exists")
		return
	}

	hash, _ := utils.HashPassword(req.Password)
	admin := &models.Admin{Email: req.Email, PasswordHash: hash}
	if err := h.adminRepo.Create(r.Context(), admin); err != nil {
		utils.InternalError(w)
		return
	}

	token, expiresAt, _ := utils.GenerateToken(admin.ID, "admin", h.cfg.JWTSecret, h.cfg.JWTExpiryHours)

	utils.Created(w, map[string]interface{}{
		"admin": map[string]interface{}{"id": admin.ID, "email": admin.Email},
		"token": token, "expires_at": expiresAt.Format(time.RFC3339),
	})
}

func (h *AdminHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	admin, err := h.adminRepo.FindByEmail(r.Context(), req.Email)
	if err != nil || !utils.CheckPassword(req.Password, admin.PasswordHash) {
		utils.Error(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect")
		return
	}

	token, expiresAt, _ := utils.GenerateToken(admin.ID, "admin", h.cfg.JWTSecret, h.cfg.JWTExpiryHours)

	utils.Success(w, map[string]interface{}{
		"admin": map[string]interface{}{"id": admin.ID, "email": admin.Email},
		"token": token, "expires_at": expiresAt.Format(time.RFC3339),
	})
}

func (h *AdminHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email" validate:"required,email"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	admin, err := h.adminRepo.FindByEmail(r.Context(), req.Email)
	if err != nil {
		utils.Success(w, map[string]string{"message": "If this email exists, a reset code has been sent."})
		return
	}

	// Generate 6-digit OTP
	code := GenerateOTP()
	codeHash, _ := utils.HashPassword(code)
	expiresAt := time.Now().Add(10 * time.Minute)

	_ = h.adminRepo.SaveOTPCode(r.Context(), admin.ID, codeHash, expiresAt)

	task, _ := tasks.NewAdminOTPTask(tasks.AdminOTPPayload{Email: req.Email, Code: code})
	_, _ = h.queue.Enqueue(task)

	utils.Success(w, map[string]string{"message": "If this email exists, a reset code has been sent."})
}

func (h *AdminHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email" validate:"required,email"`
		Code  string `json:"code" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	admin, err := h.adminRepo.FindByEmail(r.Context(), req.Email)
	if err != nil {
		utils.BadRequest(w, "INVALID_CODE", "Invalid or expired code")
		return
	}

	// Compare OTP using bcrypt
	if !utils.CheckPassword(req.Code, "") {
		// We stored bcrypt hash, verify against DB
	}
	if err := h.adminRepo.FindValidOTP(r.Context(), admin.ID, req.Code); err != nil {
		utils.BadRequest(w, "INVALID_CODE", "Invalid or expired code")
		return
	}

	_ = h.adminRepo.MarkOTPUsed(r.Context(), admin.ID, req.Code)

	// Issue a short-lived reset token
	resetToken, _, _ := utils.GenerateToken(admin.ID, "admin_reset", h.cfg.JWTSecret, 15*time.Minute)

	utils.Success(w, map[string]interface{}{
		"reset_token": resetToken,
		"message":     "Code verified. Use reset_token to set a new password.",
	})
}

func (h *AdminHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ResetToken      string `json:"reset_token" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=8"`
		ConfirmPassword string `json:"confirm_password" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if req.NewPassword != req.ConfirmPassword {
		utils.BadRequest(w, "PASSWORDS_DO_NOT_MATCH", "Passwords do not match")
		return
	}

	claims, err := utils.ParseToken(req.ResetToken, h.cfg.JWTSecret)
	if err != nil || claims.Role != "admin_reset" {
		utils.BadRequest(w, "INVALID_RESET_TOKEN", "Invalid or expired reset token")
		return
	}

	hash, _ := utils.HashPassword(req.NewPassword)
	_ = h.adminRepo.UpdatePassword(r.Context(), claims.UserID, hash)

	utils.Success(w, map[string]string{"message": "Admin password updated."})
}

// ─── Dashboard ────────────────────────────────────────────────

func (h *AdminHandler) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminRepo.GetStats(r.Context())
	if err != nil {
		utils.InternalError(w)
		return
	}
	utils.Success(w, stats)
}

// ─── Products ─────────────────────────────────────────────────

func (h *AdminHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	category := r.URL.Query().Get("category")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	products, total, err := h.productRepo.List(r.Context(), category, search, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, products, page, perPage, total)
}

func (h *AdminHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name          string   `json:"name" validate:"required"`
		Description   *string  `json:"description"`
		Category      string   `json:"category" validate:"required"`
		Price         float64  `json:"price" validate:"required,gt=0"`
		OriginalPrice float64  `json:"original_price"`
		Inventory     int      `json:"inventory"`
		Sizes         []string `json:"sizes"`
		Colors        []string `json:"colors"`
		ImageURL      string   `json:"image_url"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	p := &models.Product{
		Name: req.Name, Description: req.Description, Category: req.Category, Price: req.Price,
		Inventory: req.Inventory, Sizes: req.Sizes, Colors: req.Colors,
	}
	if req.OriginalPrice > 0 {
		p.OriginalPrice = &req.OriginalPrice
	}
	if req.ImageURL != "" {
		p.ImageURL = &req.ImageURL
	}

	if err := h.productRepo.Create(r.Context(), p); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Created(w, map[string]interface{}{"id": p.ID, "message": "Product created."})
}

func (h *AdminHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid product ID")
		return
	}

	existing, err := h.productRepo.FindByID(r.Context(), productID)
	if err != nil {
		utils.NotFound(w, "PRODUCT")
		return
	}

	var req map[string]interface{}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	if v, ok := req["name"].(string); ok {
		existing.Name = v
	}
	if v, ok := req["category"].(string); ok {
		existing.Category = v
	}
	if v, ok := req["price"].(float64); ok {
		existing.Price = v
	}
	if v, ok := req["inventory"].(float64); ok {
		existing.Inventory = int(v)
	}
	if v, ok := req["description"].(string); ok {
		existing.Description = &v
	}

	if err := h.productRepo.Update(r.Context(), existing); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"message": "Product updated."})
}

func (h *AdminHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid product ID")
		return
	}

	if err := h.productRepo.Delete(r.Context(), productID); err != nil {
		utils.NotFound(w, "PRODUCT")
		return
	}

	utils.NoContent(w)
}

// ─── Orders ───────────────────────────────────────────────────

func (h *AdminHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	status := r.URL.Query().Get("status")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	orders, total, err := h.orderRepo.ListAllAdmin(r.Context(), search, status, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, orders, page, perPage, total)
}

func (h *AdminHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	orderID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid order ID")
		return
	}

	var req struct {
		Status string `json:"status" validate:"required,oneof=Pending Processing Shipped Delivered Cancelled"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	if err := h.orderRepo.UpdateStatus(r.Context(), orderID, models.OrderStatus(req.Status)); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"message": "Order status updated to " + req.Status + "."})
}

// ─── Customers ────────────────────────────────────────────────

func (h *AdminHandler) ListCustomers(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	customers, total, err := h.adminRepo.ListCustomers(r.Context(), search, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, customers, page, perPage, total)
}

// ─── Athlete Verification ─────────────────────────────────────

func (h *AdminHandler) ListVerifications(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	search := r.URL.Query().Get("search")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	verifications, total, err := h.athleteRepo.ListVerifications(r.Context(), status, search, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, verifications, page, perPage, total)
}

func (h *AdminHandler) ReviewVerification(w http.ResponseWriter, r *http.Request) {
	athleteProfileID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid verification ID")
		return
	}

	var req struct {
		Decision string `json:"decision" validate:"required,oneof=approved rejected"`
		Notes    string `json:"notes"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	ap, err := h.athleteRepo.FindByID(r.Context(), athleteProfileID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	user, _ := h.userRepo.FindByID(r.Context(), ap.UserID)

	if req.Decision == "approved" {
		_ = h.athleteRepo.ApproveVerification(r.Context(), athleteProfileID, req.Notes)
		// Send approval email async
		task, _ := tasks.NewVerificationApprovedTask(tasks.VerificationApprovedPayload{
			Email: user.Email, FullName: user.FullName,
		})
		_, _ = h.queue.Enqueue(task)

		utils.Success(w, map[string]interface{}{
			"message": "Athlete verification approved.", "athlete_id": ap.UserID, "verified": true,
		})
	} else {
		_ = h.athleteRepo.RejectVerification(r.Context(), athleteProfileID, req.Notes)
		task, _ := tasks.NewVerificationRejectedTask(tasks.VerificationRejectedPayload{
			Email: user.Email, FullName: user.FullName, Notes: req.Notes,
		})
		_, _ = h.queue.Enqueue(task)

		utils.Success(w, map[string]interface{}{
			"message": "Athlete verification rejected.", "athlete_id": ap.UserID, "verified": false,
		})
	}
}

// ─── Vote Income Distribution ─────────────────────────────────

func (h *AdminHandler) ListAthletes(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	sport := r.URL.Query().Get("sport")
	verStatus := r.URL.Query().Get("verification_status")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	athletes, total, err := h.athleteRepo.ListForAdmin(r.Context(), search, sport, verStatus, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, athletes, page, perPage, total)
}

func (h *AdminHandler) DistributeVoteIncome(w http.ResponseWriter, r *http.Request) {
	athleteProfileID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	adminID := getUID(r)

	var req struct {
		Amount  float64 `json:"amount" validate:"required,gt=0"`
		Reason  string  `json:"reason" validate:"required"`
		Period  string  `json:"period" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	ap, err := h.athleteRepo.FindByID(r.Context(), athleteProfileID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	if err := h.athleteRepo.DistributeVoteIncome(r.Context(), ap.ID, req.Amount, req.Reason, req.Period, adminID); err != nil {
		if err == repository.ErrDuplicate {
			utils.Conflict(w, "PERIOD_ALREADY_DISTRIBUTED", "Income already distributed for this period")
			return
		}
		utils.InternalError(w)
		return
	}

	available, _, _, _ := h.athleteRepo.GetBalance(r.Context(), ap.ID)

	utils.Success(w, map[string]interface{}{
		"athlete_id":      ap.ID,
		"amount_credited": req.Amount,
		"new_balance":     available,
		"message":         "Income distributed successfully.",
	})
}

func (h *AdminHandler) AthleteTransactions(w http.ResponseWriter, r *http.Request) {
	athleteProfileID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	txs, total, err := h.athleteRepo.ListTransactions(r.Context(), athleteProfileID, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, txs, page, perPage, total)
}

// ─── Shared Handlers ─────────────────────────────────────────

func (h *AdminHandler) AddressBook(userRepo *repository.UserRepository) *AddressHandler {
	return &AddressHandler{userRepo: userRepo}
}

// ─── Helpers ──────────────────────────────────────────────────

// generateOTP is implemented in shared_handler.go as GenerateOTP()

// ─── Notifications ──────────────────────────────────────────────

func (h *AdminHandler) GetNotifications(w http.ResponseWriter, r *http.Request) {
	notifications, err := h.adminRepo.GetRecentNotifications(r.Context())
	if err != nil {
		utils.InternalError(w)
		return
	}
	utils.Success(w, notifications)
}

// ─── Withdrawals ────────────────────────────────────────────────

func (h *AdminHandler) ListWithdrawals(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	withdrawals, total, err := h.adminRepo.ListWithdrawals(r.Context(), status, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, withdrawals, page, perPage, total)
}

func (h *AdminHandler) ApproveWithdrawal(w http.ResponseWriter, r *http.Request) {
	withdrawalID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid withdrawal ID")
		return
	}

	withdrawal, connectID, err := h.adminRepo.GetWithdrawal(r.Context(), withdrawalID)
	if err != nil {
		utils.NotFound(w, "WITHDRAWAL")
		return
	}

	if withdrawal.Status != "processing" {
		utils.BadRequest(w, "INVALID_STATUS", "Only processing withdrawals can be approved")
		return
	}

	if connectID == nil || *connectID == "" {
		utils.BadRequest(w, "NO_STRIPE_ACCOUNT", "Athlete does not have a Stripe account connected")
		return
	}

	// Enqueue Stripe Transfer task
	task, _ := tasks.NewProcessWithdrawalTask(tasks.ProcessWithdrawalPayload{
		WithdrawalID:           withdrawal.ID,
		AthleteID:              withdrawal.AthleteID,
		StripeConnectAccountID: *connectID,
		Amount:                 withdrawal.Amount,
	})
	
	_, err = h.queue.Enqueue(task)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"message": "Withdrawal approved and queued for transfer."})
}

func (h *AdminHandler) RejectWithdrawal(w http.ResponseWriter, r *http.Request) {
	withdrawalID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid withdrawal ID")
		return
	}

	var req models.RejectWithdrawalRequest
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	if err := h.adminRepo.RejectWithdrawal(r.Context(), withdrawalID, req.Reason); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"message": "Withdrawal rejected and funds refunded to available balance."})
}
