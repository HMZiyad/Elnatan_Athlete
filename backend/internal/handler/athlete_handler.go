package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/uag/backend/internal/middleware"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/service"
	"github.com/uag/backend/internal/utils"
	"github.com/uag/backend/internal/config"
	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/models"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/account"
	"github.com/stripe/stripe-go/v78/accountlink"
)

// AthleteHandler handles all athlete-facing endpoints.
type AthleteHandler struct {
	athleteRepo *repository.AthleteRepository
	userRepo    *repository.UserRepository
	authSvc     *service.AuthService
	cfg         *config.Config
	queue       *asynq.Client
}

func NewAthleteHandler(athleteRepo *repository.AthleteRepository, userRepo *repository.UserRepository, authSvc *service.AuthService, cfg *config.Config, queue *asynq.Client) *AthleteHandler {
	return &AthleteHandler{
		athleteRepo: athleteRepo, 
		userRepo:    userRepo, 
		authSvc:     authSvc,
		cfg:         cfg,
		queue:       queue,
	}
}

// ─── Onboarding ──────────────────────────────────────────────

func (h *AthleteHandler) OnboardingStatus(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	completed := []string{}
	steps := []string{"identity", "sport", "story", "terms", "verification"}
	for i := 0; i < ap.OnboardingStep && i < len(steps); i++ {
		completed = append(completed, steps[i])
	}

	utils.Success(w, map[string]interface{}{
		"current_step":        ap.OnboardingStep + 1,
		"total_steps":         5,
		"completed_steps":     completed,
		"onboarding_complete": ap.OnboardingStep >= 5,
	})
}

func (h *AthleteHandler) OnboardingIdentity(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		FullName       string `json:"full_name" validate:"required"`
		Username       string `json:"username" validate:"required"`
		DateOfBirth    string `json:"date_of_birth" validate:"required"`
		Location       string `json:"location" validate:"required"`
		ProfilePhotoURL string `json:"profile_photo_url"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}

	exists, _ := h.athleteRepo.UsernameExists(r.Context(), req.Username)
	if exists {
		utils.Conflict(w, "USERNAME_TAKEN", "This username is already in use")
		return
	}

	if err := h.athleteRepo.UpdateIdentityStep(r.Context(), userID, req.FullName, req.Username, req.DateOfBirth, req.Location, req.ProfilePhotoURL); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"step": "identity", "next_step": "sport"})
}

func (h *AthleteHandler) OnboardingSport(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		Sport              string `json:"sport" validate:"required"`
		Level              string `json:"level" validate:"required,oneof=Amateur 'Semi Pro' College Pro"`
		RecentAchievements string            `json:"recent_achievements"`
		Stats              map[string]string `json:"stats"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	if err := h.athleteRepo.UpdateSportStep(r.Context(), userID,
		req.Sport, req.Level,
		req.Stats,
		req.RecentAchievements,
	); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"step": "sport", "next_step": "story"})
}

func (h *AthleteHandler) OnboardingStory(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		Bio             string   `json:"bio" validate:"required,max=240"`
		HighlightClipURL string  `json:"highlight_clip_url"`
		PhotoURLs       []string `json:"photo_urls"`
		Socials         struct {
			Instagram string `json:"instagram"`
			TwitterX  string `json:"twitter_x"`
			Youtube   string `json:"youtube"`
			Website   string `json:"website"`
		} `json:"socials"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if len(req.PhotoURLs) > 6 {
		utils.BadRequest(w, "TOO_MANY_PHOTOS", "Maximum 6 photos allowed")
		return
	}

	if err := h.athleteRepo.UpdateStoryStep(r.Context(), userID,
		req.Bio, req.HighlightClipURL,
		req.Socials.Instagram, req.Socials.TwitterX, req.Socials.Youtube, req.Socials.Website,
	); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"step": "story", "next_step": "terms"})
}

func (h *AthleteHandler) OnboardingTerms(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		AgreedToTerms          bool `json:"agreed_to_terms"`
		AgreedToPrivacy        bool `json:"agreed_to_privacy"`
		AgreedToEarningsPolicy bool `json:"agreed_to_earnings_policy"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if !req.AgreedToTerms || !req.AgreedToPrivacy || !req.AgreedToEarningsPolicy {
		utils.BadRequest(w, "AGREEMENTS_REQUIRED", "All agreements must be accepted")
		return
	}

	if err := h.athleteRepo.UpdateTermsStep(r.Context(), userID); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]string{"step": "terms", "next_step": "verification"})
}

func (h *AthleteHandler) OnboardingVerification(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req struct {
		IDDocumentURL string `json:"id_document_url" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}
	if err := utils.Validate(req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", err.Error())
		return
	}

	// Get athlete to generate referral code
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	// Generate referral code from username if available
	username := "user"
	if ap.Username != nil {
		username = *ap.Username
	}
	refCode := service.GenerateReferralCode(username)
	// Ensure uniqueness by appending user ID suffix if needed
	existing, _ := h.athleteRepo.FindByReferralCode(r.Context(), refCode)
	if existing != nil && existing.UserID != userID {
		refCode = service.GenerateReferralCode(fmt.Sprintf("%s%d", username, ap.ID.ID()))
	}
	refLink := fmt.Sprintf("https://uag.app/r/%s", refCode)

	if err := h.athleteRepo.UpdateVerificationStep(r.Context(), userID, req.IDDocumentURL, refCode, refLink); err != nil {
		utils.InternalError(w)
		return
	}

	// Mark onboarding complete on user record
	_ = h.userRepo.SetOnboardingComplete(r.Context(), userID)

	utils.Success(w, map[string]interface{}{
		"step":                "verification",
		"onboarding_complete": true,
		"verification_status": "pending",
		"referral_code":       refCode,
		"referral_link":       refLink,
	})
}

// ─── Dashboard ────────────────────────────────────────────────

func (h *AthleteHandler) Stats(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	utils.Success(w, map[string]interface{}{
		"total_earnings":      ap.LifetimeEarned,
		"total_votes":         ap.TotalVotes,
		"total_profile_views": ap.TotalProfileViews,
		"current_rank":        ap.GlobalRank,
		"tier":                ap.Tier,
	})
}

func (h *AthleteHandler) Earnings(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	utils.Success(w, map[string]interface{}{
		"available_balance": ap.AvailableBalance,
		"lifetime_earned":   ap.LifetimeEarned,
		"pending":           ap.PendingBalance,
	})
}

func (h *AthleteHandler) Dashboard(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	stats, err := h.athleteRepo.GetDashboardStats(r.Context(), ap.ID)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, stats)
}

func (h *AthleteHandler) EarningsDetailed(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	detailed, err := h.athleteRepo.GetEarningsDetailed(r.Context(), ap.ID)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, detailed)
}

func (h *AthleteHandler) StripeConnect(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	stripe.Key = h.cfg.StripeSecretKey

	var accountID string
	if ap.StripeConnectAccountID != nil && *ap.StripeConnectAccountID != "" {
		accountID = *ap.StripeConnectAccountID
	} else {
		// Create a new Express account
		params := &stripe.AccountParams{
			Type: stripe.String(string(stripe.AccountTypeExpress)),
			Capabilities: &stripe.AccountCapabilitiesParams{
				Transfers: &stripe.AccountCapabilitiesTransfersParams{
					Requested: stripe.Bool(true),
				},
			},
		}
		acct, err := account.New(params)
		if err != nil {
			utils.InternalError(w)
			return
		}
		accountID = acct.ID
		if err := h.athleteRepo.UpdateStripeConnectAccountID(r.Context(), ap.ID, accountID); err != nil {
			utils.InternalError(w)
			return
		}
	}

	// Create account link
	linkParams := &stripe.AccountLinkParams{
		Account:    stripe.String(accountID),
		RefreshURL: stripe.String(h.cfg.BaseURL + "/athlete/earnings?connect=refresh"),
		ReturnURL:  stripe.String(h.cfg.BaseURL + "/athlete/earnings?connect=success"),
		Type:       stripe.String("account_onboarding"),
	}
	link, err := accountlink.New(linkParams)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, models.StripeConnectResponse{URL: link.URL})
}

func (h *AthleteHandler) RequestWithdrawal(w http.ResponseWriter, r *http.Request) {
	var req models.WithdrawalRequest
	if err := DecodeBody(r, &req); err != nil {
		BadReq(w, "INVALID_REQUEST", "Invalid body")
		return
	}

	if req.Amount < 25.00 {
		BadReq(w, "INVALID_AMOUNT", "Minimum withdrawal is $25.00")
		return
	}

	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	if ap.StripeConnectAccountID == nil || *ap.StripeConnectAccountID == "" {
		BadReq(w, "NOT_CONNECTED", "Please connect Stripe first")
		return
	}

	if ap.AvailableBalance < req.Amount {
		BadReq(w, "INSUFFICIENT_FUNDS", "Not enough available balance")
		return
	}

	// Create withdrawal record
	_, err = h.athleteRepo.RequestWithdrawal(r.Context(), ap.ID, req.Amount, nil)
	if err != nil {
		if err.Error() == "INSUFFICIENT_FUNDS" {
			utils.Error(w, http.StatusBadRequest, "INSUFFICIENT_FUNDS", "Not enough available balance")
		} else {
			utils.InternalError(w)
		}
		return
	}

	// Withdrawal is recorded as "processing".
	// An admin will review it and enqueue the Stripe Transfer task.

	utils.Success(w, map[string]string{"message": "Withdrawal processing"})
}

func (h *AthleteHandler) Referral(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	utils.Success(w, map[string]interface{}{
		"referral_code":          ap.ReferralCode,
		"referral_link":          ap.ReferralLink,
		"earnings_per_signup":    0.50,
		"lifetime_tip_percentage": 10,
	})
}

func (h *AthleteHandler) GenerateReferralCode(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	if ap.ReferralCode != nil && *ap.ReferralCode != "" {
		utils.Success(w, map[string]interface{}{
			"referral_code": ap.ReferralCode,
		})
		return
	}

	// Generate a random 8-character code
	code := fmt.Sprintf("REF-%s", strings.ToUpper(uuid.New().String()[:8]))
	
	if err := h.athleteRepo.UpdateReferralCode(r.Context(), ap.ID, code); err != nil {
		utils.InternalError(w)
		return
	}

	utils.Success(w, map[string]interface{}{
		"referral_code": code,
	})
}

// ─── Profile ──────────────────────────────────────────────────

func (h *AthleteHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}
	user, _ := h.userRepo.FindByID(r.Context(), userID)

	media, _ := h.athleteRepo.ListMedia(r.Context(), ap.ID)

	utils.Success(w, map[string]interface{}{
		"full_name":    user.FullName,
		"email":        user.Email,
		"username":     ap.Username,
		"date_of_birth": ap.DateOfBirth,
		"location":     ap.Location,
		"avatar_url":   user.AvatarURL,
		"sport":        ap.Sport,
		"position":     ap.Position,
		"stats":        ap.Stats,
		"achievements": ap.Achievements,
		"bio":          ap.Bio,
		"socials": map[string]interface{}{
			"instagram": ap.InstagramURL,
			"twitter_x": ap.TwitterURL,
			"youtube":   ap.YoutubeURL,
			"website":   ap.WebsiteURL,
		},
		"highlight_clip_url": ap.HighlightClipURL,
		"media_gallery": media,
	})
}

func (h *AthleteHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	var req map[string]interface{}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	// Extract user-level fields
	if fullName, ok := req["full_name"].(string); ok {
		if email, ok2 := req["email"].(string); ok2 {
			_ = h.userRepo.UpdateProfile(r.Context(), userID, fullName, email, "")
		}
	}

	// Build athlete-level fields
	athleteFields := map[string]interface{}{}
	mapping := map[string]string{
		"sport": "sport", "position": "position", "achievements": "achievements",
		"bio": "bio", "location": "location", "stats": "stats",
		"highlight_clip_url": "highlight_clip_url",
	}
	for jsonKey, dbCol := range mapping {
		if v, ok := req[jsonKey]; ok {
			athleteFields[dbCol] = v
		}
	}
	if socials, ok := req["socials"].(map[string]interface{}); ok {
		if v, ok := socials["instagram"]; ok {
			athleteFields["instagram_url"] = v
		}
		if v, ok := socials["twitter_x"]; ok {
			athleteFields["twitter_url"] = v
		}
		if v, ok := socials["youtube"]; ok {
			athleteFields["youtube_url"] = v
		}
		if v, ok := socials["website"]; ok {
			athleteFields["website_url"] = v
		}
	}
	if len(athleteFields) > 0 {
		_ = h.athleteRepo.UpdateProfile(r.Context(), userID, athleteFields)
	}

	utils.Success(w, map[string]string{"message": "Profile updated successfully."})
}

func (h *AthleteHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
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

func (h *AthleteHandler) AddMedia(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	var req struct {
		Type string `json:"type" validate:"required,oneof=photo video"`
		URL  string `json:"url" validate:"required"`
	}
	if err := utils.Decode(r, &req); err != nil {
		utils.BadRequest(w, "VALIDATION_ERROR", "Invalid body")
		return
	}

	media, err := h.athleteRepo.AddMedia(r.Context(), ap.ID, req.Type, req.URL)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Created(w, map[string]interface{}{"id": media.ID, "message": "Media added to gallery."})
}

func (h *AthleteHandler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	userID := getUID(r)
	mediaID, err := uuid.Parse(chi.URLParam(r, "media_id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid media ID")
		return
	}

	ap, err := h.athleteRepo.FindByUserID(r.Context(), userID)
	if err != nil {
		utils.NotFound(w, "ATHLETE")
		return
	}

	if err := h.athleteRepo.DeleteMedia(r.Context(), mediaID, ap.ID); err != nil {
		utils.NotFound(w, "MEDIA")
		return
	}

	utils.NoContent(w)
}

// ─── Public: Explore + Leaderboard ───────────────────────────

func (h *AthleteHandler) List(w http.ResponseWriter, r *http.Request) {
	sport := r.URL.Query().Get("sport")
	search := r.URL.Query().Get("search")
	level := r.URL.Query().Get("level")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}

	athletes, total, err := h.athleteRepo.ListApproved(r.Context(), sport, search, level, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	utils.Paginated(w, athletes, page, perPage, total)
}

func (h *AthleteHandler) GetPublicProfile(w http.ResponseWriter, r *http.Request) {
	athleteID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	ap, err := h.athleteRepo.FindByID(r.Context(), athleteID)
	if err != nil || !ap.Verified {
		utils.NotFound(w, "ATHLETE")
		return
	}

	user, _ := h.userRepo.FindByID(r.Context(), ap.UserID)
	media, _ := h.athleteRepo.ListMedia(r.Context(), ap.ID)

	// Increment profile views (fire and forget)
	go h.athleteRepo.IncrementProfileViews(r.Context(), ap.ID)

	var photos []string
	for _, m := range media {
		if m.Type == "photo" {
			photos = append(photos, m.URL)
		}
	}

	utils.Success(w, map[string]interface{}{
		"id":                ap.ID,
		"full_name":         user.FullName,
		"username":          ap.Username,
		"sport":             ap.Sport,
		"location":          ap.Location,
		"bio":               ap.Bio,
		"avatar_url":        user.AvatarURL,
		"total_votes":       ap.TotalVotes,
		"rank":              ap.GlobalRank,
		"tier":              ap.Tier,
		"verified":          ap.Verified,
		"highlight_clip_url": ap.HighlightClipURL,
		"photos":            photos,
		"media_gallery":     media,
		"stats":             ap.Stats,
		"socials": map[string]interface{}{
			"instagram": ap.InstagramURL, "twitter_x": ap.TwitterURL,
			"youtube": ap.YoutubeURL, "website": ap.WebsiteURL,
		},
	})
}

func (h *AthleteHandler) Leaderboard(w http.ResponseWriter, r *http.Request) {
	sport := r.URL.Query().Get("sport")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	perPage, _ := strconv.Atoi(r.URL.Query().Get("per_page"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 20
	}

	table, total, err := h.athleteRepo.GetLeaderboard(r.Context(), sport, page, perPage)
	if err != nil {
		utils.InternalError(w)
		return
	}

	// Top 3 is always from rank 1-3
	top3, _, _ := h.athleteRepo.GetLeaderboard(r.Context(), "", 1, 3)

	utils.JSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"top_three": top3,
			"table":     table,
		},
		"meta": map[string]interface{}{
			"page": page, "per_page": perPage, "total": total,
		},
	})
}

// ─── Voting ───────────────────────────────────────────────────

func (h *AthleteHandler) CastVote(w http.ResponseWriter, r *http.Request) {
	fanID := getUID(r)
	role, _ := r.Context().Value(middleware.ContextKeyRole).(string)
	if role == "athlete" {
		utils.Forbidden(w, "Athletes cannot vote")
		return
	}

	athleteID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	ap, err := h.athleteRepo.FindByID(r.Context(), athleteID)
	if err != nil || !ap.Verified {
		utils.NotFound(w, "ATHLETE")
		return
	}

	// Check 24h rate limit via DB unique constraint
	hasVoted, _ := h.athleteRepo.HasVotedToday(r.Context(), fanID, athleteID)
	if hasVoted {
		utils.Conflict(w, "ALREADY_VOTED", "You have already voted for this athlete today")
		return
	}

	if err := h.athleteRepo.CastVote(r.Context(), fanID, athleteID); err != nil {
		if err == repository.ErrDuplicate {
			utils.Conflict(w, "ALREADY_VOTED", "You have already voted for this athlete today")
			return
		}
		utils.InternalError(w)
		return
	}

	votes, _ := h.athleteRepo.GetTotalVotes(r.Context(), athleteID)
	utils.Created(w, map[string]interface{}{
		"athlete_id":       athleteID,
		"new_total_votes":  votes,
		"message":          "Vote cast successfully.",
	})
}

func (h *AthleteHandler) VoteStatus(w http.ResponseWriter, r *http.Request) {
	athleteID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		utils.BadRequest(w, "INVALID_ID", "Invalid athlete ID")
		return
	}

	fanID := getUID(r)
	votes, _ := h.athleteRepo.GetTotalVotes(r.Context(), athleteID)
	hasVoted, _ := h.athleteRepo.HasVotedToday(r.Context(), fanID, athleteID)

	utils.Success(w, map[string]interface{}{
		"athlete_id":      athleteID,
		"total_votes":     votes,
		"has_voted_today": hasVoted,
	})
}

// ─── Helper ───────────────────────────────────────────────────

func getUID(r *http.Request) uuid.UUID {
	v := r.Context().Value(middleware.ContextKeyUserID)
	if uid, ok := v.(uuid.UUID); ok {
		return uid
	}
	return uuid.Nil
}
