package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/service"
	"github.com/uag/backend/internal/utils"
)

// FanHandler handles all fan-facing endpoints.
type FanHandler struct {
	userRepo    *repository.UserRepository
	athleteRepo *repository.AthleteRepository
	orderRepo   *repository.OrderRepository
	orderSvc    *service.OrderService
}

func NewFanHandler(userRepo *repository.UserRepository, athleteRepo *repository.AthleteRepository, orderRepo *repository.OrderRepository, orderSvc *service.OrderService) *FanHandler {
	return &FanHandler{userRepo: userRepo, athleteRepo: athleteRepo, orderRepo: orderRepo, orderSvc: orderSvc}
}

// ─── Favorites ────────────────────────────────────────────────

func (h *FanHandler) ListFavorites(w http.ResponseWriter, r *http.Request) {
	fanID := getUID(r)
	// Query favorites joined with athlete/user data
	rows, err := h.userRepo.DB().Query(r.Context(), `
		SELECT ap.id, u.full_name, ap.username, ap.sport, ap.location,
		       ap.total_votes, u.avatar_url, ap.verified, f.created_at
		FROM favorites f
		JOIN athlete_profiles ap ON f.athlete_id = ap.id
		JOIN users u ON ap.user_id = u.id
		WHERE f.fan_id = $1
		ORDER BY f.created_at DESC`, fanID,
	)
	if err != nil {
		utils.InternalError(w)
		return
	}
	defer rows.Close()

	var result []map[string]interface{}
	for rows.Next() {
		var id, fullName, username, sport, location, createdAt string
		var avatarURL *string
		var totalVotes int64
		var verified bool
		if err := rows.Scan(&id, &fullName, &username, &sport, &location, &totalVotes, &avatarURL, &verified, &createdAt); err != nil {
			continue
		}
		result = append(result, map[string]interface{}{
			"athlete_id": id, "full_name": fullName, "username": username,
			"sport": sport, "location": location, "total_votes": totalVotes,
			"avatar_url": avatarURL, "verified": verified, "favorited_at": createdAt,
		})
	}

	if result == nil {
		result = []map[string]interface{}{}
	}
	utils.Success(w, result)
}

func (h *FanHandler) AddFavorite(w http.ResponseWriter, r *http.Request) {
	fanID := getUID(r)
	var req struct {
		AthleteID string `json:"athlete_id" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	athleteID, err := uuid.Parse(req.AthleteID)
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	_, err = h.userRepo.DB().Exec(r.Context(),
		`INSERT INTO favorites (id, fan_id, athlete_id) VALUES ($1, $2, $3)`,
		uuid.New(), fanID, athleteID,
	)
	if err != nil {
		if containsStr2(err.Error(), "unique") || containsStr2(err.Error(), "23505") {
			utils.Conflict(w, "ALREADY_FAVORITED", "Already in favorites")
			return
		}
		utils.InternalError(w)
		return
	}

	utils.Created(w, map[string]string{"message": "Athlete added to favorites."})
}

func (h *FanHandler) RemoveFavorite(w http.ResponseWriter, r *http.Request) {
	fanID := getUID(r)
	athleteID, err := uuid.Parse(chi.URLParam(r, "athlete_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	_, _ = h.userRepo.DB().Exec(r.Context(),
		`DELETE FROM favorites WHERE fan_id = $1 AND athlete_id = $2`,
		fanID, athleteID,
	)

	utils.NoContent(w)
}

// ─── Fan Profile ──────────────────────────────────────────────

func (h *FanHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	user, err := h.userRepo.FindByID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "USER")
		return
	}

	parts := splitName(user.FullName)
	utils.Success(w, map[string]interface{}{
		"id":           user.ID,
		"first_name":   parts[0],
		"last_name":    parts[1],
		"email":        user.Email,
		"avatar_url":   user.AvatarURL,
		"member_since": user.CreatedAt.Format("2006-01-02"),
	})
}

func (h *FanHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	fullName := req.FirstName + " " + req.LastName
	_ = h.userRepo.UpdateProfile(r.Context(), userID, fullName, req.Email, req.Phone)

	utils.Success(w, map[string]string{"message": "Profile updated."})
}

func (h *FanHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		CurrentPassword string `json:"current_password" validate:"required"`
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

	user, err := h.userRepo.FindByID(r.Context(), userID)
	if err != nil || !utils.CheckPassword(req.CurrentPassword, user.PasswordHash) {
		utils.Error(w, http.StatusUnauthorized, "WRONG_CURRENT_PASSWORD", "Current password is incorrect")
		return
	}

	hash, _ := utils.HashPassword(req.NewPassword)
	_ = h.userRepo.UpdatePassword(r.Context(), userID, hash)

	utils.Success(w, map[string]string{"message": "Password changed successfully."})
}

// ─── Orders ───────────────────────────────────────────────────

func (h *FanHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	status := r.URL.Query().Get("status")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 20
	}

	orders, total, err := h.orderRepo.ListByUserID(r.Context(), userID, status, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, orders, page, perPage, total)
}

func (h *FanHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	orderID, err := uuid.Parse(chi.URLParam(r, "order_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid order ID")
		return
	}

	order, err := h.orderRepo.FindByID(r.Context(), orderID, userID)
	if err != nil {
		utils.NotFound(w, "ORDER")
		return
	}

	utils.Success(w, order)
}

// ─── Checkout ─────────────────────────────────────────────────

func (h *FanHandler) Checkout(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		AddressID       string `json:"address_id" validate:"required"`
		PaymentMethodID string `json:"payment_method_id" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	addressID, err := uuid.Parse(req.AddressID)
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid address ID")
		return
	}
	pmID, err := uuid.Parse(req.PaymentMethodID)
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid payment method ID")
		return
	}

	order, err := h.orderSvc.PlaceOrder(r.Context(), userID, addressID, pmID)
	if err != nil {
		switch {
		case err.Error() == "EMPTY_CART":
			utils.BadRequest(w, "EMPTY_CART", "Your cart is empty")
		case err.Error() == "INVALID_ADDRESS":
			utils.BadRequest(w, "INVALID_ADDRESS", "Shipping address not found")
		case err.Error() == "INVALID_PAYMENT_METHOD":
			utils.BadRequest(w, "INVALID_PAYMENT_METHOD", "Payment method not found")
		case len(err.Error()) > 16 && err.Error()[:16] == "PAYMENT_FAILED: ":
			utils.Error(w, http.StatusPaymentRequired, "PAYMENT_FAILED", err.Error()[16:])
		default:
			utils.InternalError(w)
		}
		return
	}

	utils.Created(w, map[string]interface{}{
		"order_id":     order.ID,
		"order_number": order.OrderNumber,
		"status":       order.Status,
		"total":        order.Total,
		"message":      "Order placed successfully.",
	})
}

// ─── Helpers ──────────────────────────────────────────────────

func splitName(fullName string) [2]string {
	for i, c := range fullName {
		if c == ' ' {
			return [2]string{fullName[:i], fullName[i+1:]}
		}
	}
	return [2]string{fullName, ""}
}

func containsStr2(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || func() bool {
		for i := 0; i <= len(s)-len(sub); i++ {
			if s[i:i+len(sub)] == sub {
				return true
			}
		}
		return false
	}())
}
