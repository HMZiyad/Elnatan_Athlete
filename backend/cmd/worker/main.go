// Worker process — the "Celery" equivalent in Go.
// Consumes tasks from Redis queues via Asynq.
// Also runs a periodic scheduler for the leaderboard refresh.
package main

import (
	"context"
	"log"

	"github.com/hibiken/asynq"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/database"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/tasks"
	"go.uber.org/zap"
)

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal("failed to load config:", err)
	}

	// ─── Database ─────────────────────────────────────────────
	pool, err := database.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	defer pool.Close()

	// ─── Repositories ─────────────────────────────────────────
	athleteRepo := repository.NewAthleteRepository(pool)
	userRepo    := repository.NewUserRepository(pool)

	// ─── Redis Options ────────────────────────────────────────
	redisOpt := asynq.RedisClientOpt{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	}

	// ─── Task Handlers ────────────────────────────────────────
	emailHandler     := tasks.NewEmailHandler(cfg, logger)
	referralHandler  := tasks.NewReferralHandler(athleteRepo, userRepo, logger)
	leaderboardHandler := tasks.NewLeaderboardHandler(athleteRepo, logger)

	// ─── Asynq Server (worker) ────────────────────────────────
	srv := asynq.NewServer(redisOpt, asynq.Config{
		Concurrency: 10,
		Queues: map[string]int{
			"critical": 6, // Stripe webhooks, order confirmations
			"default":  3, // Emails, referrals
			"low":      1, // Leaderboard refresh
		},
	})

	mux := asynq.NewServeMux()

	// Register email task handlers
	mux.HandleFunc(tasks.TypeEmailPasswordReset, emailHandler.HandlePasswordReset)
	mux.HandleFunc(tasks.TypeEmailOrderConfirmation, emailHandler.HandleOrderConfirmation)
	mux.HandleFunc(tasks.TypeEmailVerificationApproved, emailHandler.HandleVerificationApproved)
	mux.HandleFunc(tasks.TypeEmailVerificationRejected, emailHandler.HandleVerificationRejected)
	mux.HandleFunc(tasks.TypeEmailAdminOTP, emailHandler.HandleAdminOTP)

	// Register referral task handlers
	mux.HandleFunc(tasks.TypeReferralSignupCredit, referralHandler.HandleSignupCredit)
	mux.HandleFunc(tasks.TypeReferralTipCredit, referralHandler.HandleTipCredit)

	// Register leaderboard task handler
	mux.HandleFunc(tasks.TypeLeaderboardRefresh, leaderboardHandler.HandleLeaderboardRefresh)

	// Register stripe task handler
	stripeHandler := tasks.NewStripeTaskProcessor(athleteRepo, cfg.StripeSecretKey)
	mux.HandleFunc(tasks.TypeProcessWithdrawal, stripeHandler.HandleProcessWithdrawalTask)

	// ─── Asynq Scheduler (cron jobs) ─────────────────────────
	// Refresh leaderboard rankings every hour
	scheduler := asynq.NewScheduler(redisOpt, nil)
	if _, err := scheduler.Register("0 * * * *", tasks.NewLeaderboardRefreshTask()); err != nil {
		log.Fatal("failed to register leaderboard cron:", err)
	}

	// Start the scheduler in background
	go func() {
		if err := scheduler.Run(); err != nil {
			logger.Fatal("scheduler error", zap.Error(err))
		}
	}()

	// Run an initial leaderboard refresh on worker start
	client := asynq.NewClient(redisOpt)
	if _, err := client.Enqueue(tasks.NewLeaderboardRefreshTask()); err != nil {
		logger.Warn("failed to enqueue initial leaderboard refresh", zap.Error(err))
	}
	client.Close()

	logger.Info("worker started — listening for tasks on Redis", zap.String("addr", cfg.RedisAddr))

	// Start worker (blocking)
	if err := srv.Run(mux); err != nil {
		logger.Fatal("worker error", zap.Error(err))
	}

	_ = context.Background() // keep context import
}
