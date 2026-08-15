package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

type currentUserKey struct{}
type supabaseUserKey struct{}

// RequireSupabaseToken verifies the Supabase access token in the Authorization
// header and stores it in the request context. Unlike RequireAuth, it does not
// require a corresponding DB user to exist yet.
func RequireSupabaseToken(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authUser, err := verifySupabaseToken(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), supabaseUserKey{}, authUser)
		next(w, r.WithContext(ctx))
	}
}

// RequireAuth verifies the Supabase access token and resolves the corresponding
// DB user. If the token is valid but no DB user exists yet, it responds 404 so
// the frontend can call POST /auth/bootstrap.
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authUser, err := verifySupabaseToken(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		userRepo := &repository.UserRepository{}
		user, err := userRepo.GetUserByAuthUID(authUser.ID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				writeAuthError(w, http.StatusNotFound, "User not bootstrapped; call POST /auth/bootstrap first")
				return
			}
			writeAuthError(w, http.StatusInternalServerError, "Failed to resolve user")
			return
		}

		ctx := context.WithValue(r.Context(), supabaseUserKey{}, authUser)
		ctx = context.WithValue(ctx, currentUserKey{}, user)
		next(w, r.WithContext(ctx))
	}
}

// OptionalAuth resolves a Supabase user when Authorization is present, but
// allows unauthenticated requests to continue. Invalid tokens still fail.
func OptionalAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if strings.TrimSpace(r.Header.Get("Authorization")) == "" {
			next(w, r)
			return
		}

		authUser, err := verifySupabaseToken(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), supabaseUserKey{}, authUser)

		userRepo := &repository.UserRepository{}
		user, err := userRepo.GetUserByAuthUID(authUser.ID)
		if err == nil {
			ctx = context.WithValue(ctx, currentUserKey{}, user)
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			writeAuthError(w, http.StatusInternalServerError, "Failed to resolve user")
			return
		}

		next(w, r.WithContext(ctx))
	}
}

func RequireRole(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[role] = struct{}{}
	}

	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			user, ok := CurrentUser(r)
			if !ok {
				writeAuthError(w, http.StatusUnauthorized, "Authorization header required")
				return
			}
			if _, ok := allowed[user.Role]; !ok {
				writeAuthError(w, http.StatusForbidden, "Insufficient permissions")
				return
			}
			next(w, r)
		}
	}
}

func CurrentUser(r *http.Request) (*models.User, bool) {
	user, ok := r.Context().Value(currentUserKey{}).(*models.User)
	return user, ok
}

func SupabaseUser(r *http.Request) (*config.SupabaseUser, bool) {
	user, ok := r.Context().Value(supabaseUserKey{}).(*config.SupabaseUser)
	return user, ok
}

func verifySupabaseToken(r *http.Request) (*config.SupabaseUser, error) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if authHeader == "" {
		return nil, errAuthHeaderRequired
	}

	accessToken := authHeader
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		accessToken = strings.TrimSpace(authHeader[7:])
	}
	if accessToken == "" {
		return nil, errAuthHeaderRequired
	}

	user, err := config.VerifySupabaseAccessToken(r.Context(), accessToken)
	if err != nil {
		return nil, errInvalidAuthToken
	}
	return user, nil
}

var (
	errAuthHeaderRequired = &authError{message: "Authorization header required"}
	errInvalidAuthToken   = &authError{message: "Invalid or expired authorization token"}
)

type authError struct {
	message string
}

func (e *authError) Error() string {
	return e.message
}

func writeAuthError(w http.ResponseWriter, statusCode int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
}
