package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/redis/go-redis/v9"
	"github.com/uag/backend/internal/utils"
)

type contextKey string

const (
	ContextKeyUserID contextKey = "userID"
	ContextKeyRole   contextKey = "role"
)

// Auth returns a middleware that validates JWT Bearer tokens.
// It also checks the Redis blocklist for invalidated tokens (logout).
func Auth(jwtSecret string, rdb *redis.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				utils.Unauthorized(w, "Missing or malformed Authorization header")
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			// Check Redis blocklist for logged-out tokens
			blocklisted, err := rdb.Get(r.Context(), "blocklist:"+tokenStr).Result()
			if err == nil && blocklisted != "" {
				utils.Unauthorized(w, "Token has been revoked")
				return
			}

			claims, err := utils.ParseToken(tokenStr, jwtSecret)
			if err != nil {
				utils.Unauthorized(w, "Invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyUserID, claims.UserID)
			ctx = context.WithValue(ctx, ContextKeyRole, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole returns middleware that checks the user has one of the given roles.
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, _ := r.Context().Value(ContextKeyRole).(string)
			for _, allowed := range roles {
				if role == allowed {
					next.ServeHTTP(w, r)
					return
				}
			}
			utils.Forbidden(w, "You don't have permission to access this resource")
		})
	}
}

// AdminAuth validates admin JWT tokens.
func AdminAuth(jwtSecret string, rdb *redis.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				utils.Unauthorized(w, "Missing or malformed Authorization header")
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			blocklisted, err := rdb.Get(r.Context(), "blocklist:"+tokenStr).Result()
			if err == nil && blocklisted != "" {
				utils.Unauthorized(w, "Token has been revoked")
				return
			}

			claims, err := utils.ParseToken(tokenStr, jwtSecret)
			if err != nil {
				utils.Unauthorized(w, "Invalid or expired token")
				return
			}

			if claims.Role != "admin" {
				utils.Forbidden(w, "Admin access required")
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyUserID, claims.UserID)
			ctx = context.WithValue(ctx, ContextKeyRole, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// OptionalAuth attaches user info to context if a valid token is present,
// but does not reject requests without a token.
func OptionalAuth(jwtSecret string, rdb *redis.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
				if claims, err := utils.ParseToken(tokenStr, jwtSecret); err == nil {
					ctx := context.WithValue(r.Context(), ContextKeyUserID, claims.UserID)
					ctx = context.WithValue(ctx, ContextKeyRole, claims.Role)
					r = r.WithContext(ctx)
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
