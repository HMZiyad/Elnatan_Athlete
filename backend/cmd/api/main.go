package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
	"github.com/uag/backend/internal/config"
	"github.com/uag/backend/internal/database"
	"github.com/uag/backend/internal/repository"
	"github.com/uag/backend/internal/router"
	"github.com/uag/backend/internal/service"
	"go.uber.org/zap"
)

func main() {
	// ─── Logger ───────────────────────────────────────────────
	log, _ := zap.NewProduction()
	defer log.Sync()

	// ─── Config ───────────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("failed to load config", zap.Error(err))
	}

	// ─── Database ─────────────────────────────────────────────
	pool, err := database.NewPool(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer pool.Close()
	log.Info("connected to PostgreSQL")

	// Run migrations
	if err := database.RunMigrations(cfg.DatabaseURL, "./internal/database/migrations"); err != nil {
		log.Fatal("failed to run migrations", zap.Error(err))
	}
	log.Info("database migrations applied")

	// ─── Redis ────────────────────────────────────────────────
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Fatal("failed to connect to Redis", zap.Error(err))
	}
	log.Info("connected to Redis")

	// ─── Asynq Client (task producer) ─────────────────────────
	asynqClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})
	defer asynqClient.Close()

	// ─── Repositories ─────────────────────────────────────────
	userRepo    := repository.NewUserRepository(pool)
	athleteRepo := repository.NewAthleteRepository(pool)
	productRepo := repository.NewProductRepository(pool)
	cartRepo    := repository.NewCartRepository(pool)
	orderRepo   := repository.NewOrderRepository(pool)
	adminRepo   := repository.NewAdminRepository(pool)

	// ─── Services ─────────────────────────────────────────────
	authSvc  := service.NewAuthService(userRepo, athleteRepo, cfg, asynqClient)
	orderSvc := service.NewOrderService(orderRepo, cartRepo, productRepo, userRepo, athleteRepo, cfg, asynqClient, log)

	// ─── Router ───────────────────────────────────────────────
	r := router.New(cfg, log, rdb, userRepo, athleteRepo, productRepo, cartRepo, orderRepo, adminRepo, authSvc, orderSvc, asynqClient)

	// ─── HTTP Server ──────────────────────────────────────────
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Info("starting HTTP server", zap.String("port", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	<-quit
	log.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("server forced to shutdown", zap.Error(err))
	}

	log.Info("server stopped")
}
