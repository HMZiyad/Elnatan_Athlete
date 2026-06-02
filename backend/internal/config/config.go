package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Server
	AppEnv string
	Port   string

	// Database
	DatabaseURL string

	// Redis
	RedisAddr     string
	RedisPassword string
	RedisDB       int

	// JWT
	JWTSecret      string
	JWTExpiryHours time.Duration

	// Stripe
	StripeSecretKey      string
	StripeWebhookSecret  string

	// File uploads
	UploadDir string
	BaseURL   string

	// Email
	SMTPHost  string
	SMTPPort  int
	SMTPUser  string
	SMTPPass  string
	EmailFrom string

	// Referral system
	ReferralSignupCredit    float64
	ReferralTipPercentage   float64
}

// Load reads the .env file (if present) and returns a Config struct.
func Load() (*Config, error) {
	// Load .env — ignore error in production where env vars are injected directly
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:      getEnv("APP_ENV", "development"),
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: mustEnv("DATABASE_URL"),

		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvInt("REDIS_DB", 0),

		JWTSecret:      mustEnv("JWT_SECRET"),
		JWTExpiryHours: time.Duration(getEnvInt("JWT_EXPIRY_HOURS", 168)) * time.Hour,

		StripeSecretKey:     mustEnv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: mustEnv("STRIPE_WEBHOOK_SECRET"),

		UploadDir: getEnv("UPLOAD_DIR", "./uploads"),
		BaseURL:   getEnv("BASE_URL", "http://localhost:8080"),

		SMTPHost:  getEnv("SMTP_HOST", ""),
		SMTPPort:  getEnvInt("SMTP_PORT", 587),
		SMTPUser:  getEnv("SMTP_USER", ""),
		SMTPPass:  getEnv("SMTP_PASS", ""),
		EmailFrom: getEnv("EMAIL_FROM", "noreply@uag.app"),

		ReferralSignupCredit:  getEnvFloat("REFERRAL_SIGNUP_CREDIT", 0.50),
		ReferralTipPercentage: getEnvFloat("REFERRAL_TIP_PERCENTAGE", 0.10),
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic(fmt.Sprintf("required environment variable %q is not set", key))
	}
	return v
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return i
}

func getEnvFloat(key string, fallback float64) float64 {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	f, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return fallback
	}
	return f
}
