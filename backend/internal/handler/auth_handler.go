package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/uag/backend/internal/middleware"
	"github.com/uag/backend/internal/service"
	"github.com/uag/backend/internal/utils"
)

// AuthHandler handles public auth endpoints.
type AuthHandler struct {
	svc    *service.AuthService
	rdb    *redis.Client
	secret string
}

func NewAuthHandler(svc *service.AuthService, rdb *redis.Client, secret string) *AuthHandler {
	return &AuthHandler{svc: svc, rdb: rdb, secret: secret}
}

// Register godoc
// POST /api/v1/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FullName     string `json:"full_name" validate:"required"`
		Email        string `json:"email" validate:"required,email"`
		Password     string `json:"password" validate:"required,min=8"`
		Role         string `json:"role" validate:"required,oneof=fan athlete"`
		ReferralCode string `json:"referral_code"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid request body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}

	user, token, expiresAt, err := h.svc.Register(r.Context(), req.FullName, req.Email, req.Password, req.Role, req.ReferralCode)
	if err != nil {
		switch err.Error() {
		case "EMAIL_ALREADY_EXISTS":
			utils.Conflict(w, "EMAIL_ALREADY_EXISTS", "An account with this email already exists")
		default:
			utils.InternalError(w)
		}
		return
	}

	utils.Created(w, map[string]interface{}{
		"user": map[string]interface{}{
			"id": user.ID, "full_name": user.FullName, "email": user.Email,
			"role": user.Role, "onboarding_complete": user.OnboardingComplete,
		},
		"token":      token,
		"expires_at": expiresAt.Format(time.RFC3339),
	})
}

// Login godoc
// POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required"`
		Role     string `json:"role" validate:"required,oneof=fan athlete"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid request body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}

	user, token, expiresAt, err := h.svc.Login(r.Context(), req.Email, req.Password, req.Role)
	if err != nil {
		switch err.Error() {
		case "WRONG_ROLE":
			utils.Error(w, http.StatusForbidden, "WRONG_ROLE", "Account exists but with a different role")
		default:
			utils.Error(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect")
		}
		return
	}

	utils.Success(w, map[string]interface{}{
		"user": map[string]interface{}{
			"id": user.ID, "full_name": user.FullName, "email": user.Email,
			"role": user.Role, "onboarding_complete": user.OnboardingComplete,
			"avatar_url": user.AvatarURL,
		},
		"token":      token,
		"expires_at": expiresAt.Format(time.RFC3339),
	})
}

// Logout godoc
// POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.NoContent(w)
		return
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := utils.ParseToken(tokenStr, h.secret)
	if err != nil {
		utils.NoContent(w)
		return
	}

	// Add token to Redis blocklist with TTL matching token expiry
	ttl := time.Until(claims.ExpiresAt.Time)
	h.rdb.Set(r.Context(), "blocklist:"+tokenStr, "1", ttl)

	utils.NoContent(w)
}

// Me godoc
// GET /api/v1/auth/me
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value(middleware.ContextKeyUserID).(interface{ String() string })
	if userID == nil {
		utils.Unauthorized(w, "Not authenticated")
		return
	}

	// Use the UUID from context
	uid, _ := r.Context().Value(middleware.ContextKeyUserID).(interface{})
	_ = uid

	utils.Success(w, map[string]interface{}{"message": "use /fans/me/profile or /athletes/me/profile for full data"})
}

// ForgotPassword godoc
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email" validate:"required,email"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid request body")
		return
	}

	_ = h.svc.ForgotPassword(r.Context(), req.Email)
	utils.Success(w, map[string]string{"message": "If this email exists, a reset link has been sent."})
}

// ResetPassword godoc
// POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token           string `json:"token" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=8"`
		ConfirmPassword string `json:"confirm_password" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid request body")
		return
	}
	if req.NewPassword != req.ConfirmPassword {
		utils.BadRequest(w, "PASSWORDS_DO_NOT_MATCH", "Passwords do not match")
		return
	}

	if err := h.svc.ResetPassword(r.Context(), req.Token, req.NewPassword); err != nil {
		utils.BadRequest(w, "INVALID_RESET_TOKEN", "Reset token is invalid or expired")
		return
	}

	utils.Success(w, map[string]string{"message": "Password updated successfully."})
}
