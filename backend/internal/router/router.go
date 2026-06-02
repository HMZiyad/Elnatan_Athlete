package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/handler"
	"github.com/uag/backend/internal/middleware"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/service"
	"go.uber.org/zap"
)

// New constructs and returns the Chi router with all routes registered.
func New(
	cfg *config.Config,
	log *zap.Logger,
	rdb *redis.Client,
	userRepo *repository.UserRepository,
	athleteRepo *repository.AthleteRepository,
	productRepo *repository.ProductRepository,
	cartRepo *repository.CartRepository,
	orderRepo *repository.OrderRepository,
	adminRepo *repository.AdminRepository,
	authSvc *service.AuthService,
	orderSvc *service.OrderService,
	asynqClient *asynq.Client,
) http.Handler {
	r := chi.NewRouter()

	// ─── Global Middleware ─────────────────────────────────────
	r.Use(middleware.Recovery(log))
	r.Use(middleware.Logger(log))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", cfg.BaseURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(chimiddleware.Compress(5))

	// ─── Auth shortcuts ────────────────────────────────────────
	authMW := middleware.Auth(cfg.JWTSecret, rdb)
	adminMW := middleware.AdminAuth(cfg.JWTSecret, rdb)
	requireFan := middleware.RequireRole("fan")
	requireAthlete := middleware.RequireRole("athlete")

	// ─── Handlers ─────────────────────────────────────────────
	authH := handler.NewAuthHandler(authSvc, rdb, cfg.JWTSecret)
	athleteH := handler.NewAthleteHandler(athleteRepo, userRepo, authSvc)
	fanH := handler.NewFanHandler(userRepo, athleteRepo, orderRepo, orderSvc)
	adminH := handler.NewAdminHandler(adminRepo, athleteRepo, orderRepo, productRepo, userRepo, cfg, asynqClient)
	addrH := handler.NewAddressHandler(userRepo)
	productH := handler.NewProductHandler(productRepo)
	cartH := handler.NewCartHandler(cartRepo, productRepo)
	uploadH := handler.NewUploadHandler(cfg.UploadDir, cfg.BaseURL)

	// ─── Static file serving for uploads ──────────────────────
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))))

	// ─── API v1 ───────────────────────────────────────────────
	r.Route("/api/v1", func(r chi.Router) {

		// ── Public Auth ────────────────────────────────────────
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authH.Register)
			r.Post("/login", authH.Login)
			r.Post("/forgot-password", authH.ForgotPassword)
			r.Post("/reset-password", authH.ResetPassword)
			// Protected
			r.With(authMW).Post("/logout", authH.Logout)
			r.With(authMW).Get("/me", authH.Me)
		})

		// ── Admin Auth ─────────────────────────────────────────
		r.Route("/admin/auth", func(r chi.Router) {
			r.Post("/signup", adminH.Signup) // First admin requires no token; subsequent ones need admin token
			r.Post("/login", adminH.Login)
			r.Post("/forgot-password", adminH.ForgotPassword)
			r.Post("/verify-code", adminH.VerifyOTP)
			r.Post("/reset-password", adminH.ResetPassword)
		})

		// ── Admin Protected Routes ─────────────────────────────
		r.Route("/admin", func(r chi.Router) {
			r.Use(adminMW)

			r.Get("/stats", adminH.Stats)

			// Products
			r.Get("/products", adminH.ListProducts)
			r.Post("/products", adminH.CreateProduct)
			r.Put("/products/{id}", adminH.UpdateProduct)
			r.Delete("/products/{id}", adminH.DeleteProduct)

			// Orders
			r.Get("/orders", adminH.ListOrders)
			r.Put("/orders/{id}/status", adminH.UpdateOrderStatus)

			// Customers
			r.Get("/customers", adminH.ListCustomers)

			// Verifications
			r.Get("/verifications", adminH.ListVerifications)
			r.Put("/verifications/{id}", adminH.ReviewVerification)

			// Athletes
			r.Get("/athletes", adminH.ListAthletes)
			r.Post("/athletes/{id}/distribute-income", adminH.DistributeVoteIncome)
			r.Get("/athletes/{id}/transactions", adminH.AthleteTransactions)
		})

		// ── Public: Athletes Explore & Leaderboard ─────────────
		r.Get("/athletes", athleteH.List)
		r.Get("/athletes/leaderboard", athleteH.Leaderboard)
		r.Get("/athletes/{id}", athleteH.GetPublicProfile)

		// ── Public: Products ────────────────────────────────────
		r.Get("/products", productH.List)
		r.Get("/products/{id}", productH.Get)

		// ── Authenticated: Voting (fans only) ──────────────────
		r.With(authMW).With(requireFan).Post("/athletes/{id}/vote", athleteH.CastVote)
		r.With(authMW).Get("/athletes/{id}/vote-status", athleteH.VoteStatus)

		// ── Athlete Protected Routes ───────────────────────────
		r.Route("/athletes/me", func(r chi.Router) {
			r.Use(authMW)
			r.Use(requireAthlete)

			// Onboarding
			r.Get("/onboarding/status", athleteH.OnboardingStatus)
			r.Put("/onboarding/identity", athleteH.OnboardingIdentity)
			r.Put("/onboarding/sport", athleteH.OnboardingSport)
			r.Put("/onboarding/story", athleteH.OnboardingStory)
			r.Put("/onboarding/terms", athleteH.OnboardingTerms)
			r.Put("/onboarding/verification", athleteH.OnboardingVerification)

			// Dashboard
			r.Get("/stats", athleteH.Stats)
			r.Get("/earnings", athleteH.Earnings)
			r.Get("/referral", athleteH.Referral)

			// Profile
			r.Get("/profile", athleteH.GetProfile)
			r.Put("/profile", athleteH.UpdateProfile)
			r.Put("/password", athleteH.ChangePassword)
			r.Post("/media", athleteH.AddMedia)
			r.Delete("/media/{media_id}", athleteH.DeleteMedia)
		})

		// ── Fan Protected Routes ───────────────────────────────
		r.Route("/fans/me", func(r chi.Router) {
			r.Use(authMW)
			r.Use(requireFan)

			r.Get("/profile", fanH.GetProfile)
			r.Put("/profile", fanH.UpdateProfile)
			r.Put("/password", fanH.ChangePassword)

			r.Get("/favorites", fanH.ListFavorites)
			r.Post("/favorites", fanH.AddFavorite)
			r.Delete("/favorites/{athlete_id}", fanH.RemoveFavorite)

			r.Get("/orders", fanH.ListOrders)
			r.Get("/orders/{order_id}", fanH.GetOrder)
		})

		// ── Shared: Addresses & Payment Methods ───────────────
		r.Route("/users/me", func(r chi.Router) {
			r.Use(authMW)

			// Addresses
			r.Get("/addresses", addrH.List)
			r.Post("/addresses", addrH.Create)
			r.Put("/addresses/{address_id}", addrH.Update)
			r.Delete("/addresses/{address_id}", addrH.Delete)
			r.Put("/addresses/{address_id}/set-default", addrH.SetDefault)

			// Payment methods (implemented inline with order service)
			r.Get("/payment-methods", func(w http.ResponseWriter, r *http.Request) {
				userID := handler.GetUID(r)
				pms, err := userRepo.ListPaymentMethods(r.Context(), userID)
				if err != nil {
					handler.InternalErr(w)
					return
				}
				handler.OK(w, pms)
			})

			r.Post("/payment-methods", func(w http.ResponseWriter, r *http.Request) {
				userID := handler.GetUID(r)
				var req struct {
					StripePMID string `json:"stripe_payment_method_id"`
				}
				if err := handler.DecodeBody(r, &req); err != nil || req.StripePMID == "" {
					handler.BadReq(w, "VALIDATION_ERROR", "stripe_payment_method_id is required")
					return
				}
				pm, err := orderSvc.AttachPaymentMethod(r.Context(), userID, req.StripePMID)
				if err != nil {
					handler.BadReq(w, "STRIPE_ERROR", err.Error())
					return
				}
				handler.Created(w, pm)
			})

			r.Put("/payment-methods/{pm_id}/set-default", func(w http.ResponseWriter, r *http.Request) {
				userID := handler.GetUID(r)
				pmID, _ := handler.ParseUUID(r, "pm_id")
				if err := userRepo.SetDefaultPaymentMethod(r.Context(), pmID, userID); err != nil {
					handler.NotFoundErr(w, "PAYMENT_METHOD")
					return
				}
				handler.OK(w, map[string]string{"message": "Default payment method updated."})
			})

			r.Delete("/payment-methods/{pm_id}", func(w http.ResponseWriter, r *http.Request) {
				userID := handler.GetUID(r)
				pmID, _ := handler.ParseUUID(r, "pm_id")
				if err := orderSvc.DetachPaymentMethod(r.Context(), pmID, userID); err != nil {
					handler.BadReq(w, err.Error(), err.Error())
					return
				}
				handler.NoContent(w)
			})
		})

		// ── Cart ────────────────────────────────────────────────
		r.Route("/cart", func(r chi.Router) {
			r.Use(authMW)
			r.Use(requireFan)

			r.Get("/", cartH.Get)
			r.Post("/", cartH.AddItem)
			r.Put("/{cart_item_id}", cartH.UpdateItem)
			r.Delete("/{cart_item_id}", cartH.RemoveItem)
			r.Delete("/", cartH.Clear)
		})

		// ── Checkout ───────────────────────────────────────────
		r.With(authMW).With(requireFan).Post("/orders", fanH.Checkout)

		// ── File Uploads ───────────────────────────────────────
		r.With(authMW).Post("/uploads", uploadH.Upload)

		// ── Health Check ───────────────────────────────────────
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"status":"ok"}`))
		})
	})

	return r
}
