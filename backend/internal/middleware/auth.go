package middleware

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	firebaseauth "firebase.google.com/go/v4/auth"
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

type currentUserKey struct{}
type firebaseTokenKey struct{}

// RequireFirebaseToken verifies the Firebase ID token in the Authorization
// header and stores it in the request context. Unlike RequireAuth, it does
// not require a corresponding DB user to exist yet, so it's suitable for
// endpoints like /auth/bootstrap that create the DB user record.
func RequireFirebaseToken(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := verifyFirebaseToken(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), firebaseTokenKey{}, token)
		next(w, r.WithContext(ctx))
	}
}

// RequireAuth verifies the Firebase ID token and resolves the corresponding
// DB user, storing both in the request context before calling the next
// handler. If the token is valid but no DB user has been bootstrapped yet,
// it responds 404 so the frontend can redirect to POST /auth/bootstrap.
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := verifyFirebaseToken(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		userRepo := &repository.UserRepository{}
		user, err := userRepo.GetUserByFirebaseUID(token.UID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				writeAuthError(w, http.StatusNotFound, "User not bootstrapped; call POST /auth/bootstrap first")
				return
			}
			writeAuthError(w, http.StatusInternalServerError, "Failed to resolve user")
			return
		}

		ctx := context.WithValue(r.Context(), firebaseTokenKey{}, token)
		ctx = context.WithValue(ctx, currentUserKey{}, user)
		next(w, r.WithContext(ctx))
	}
}

// RequireRole wraps a RequireAuth-protected handler with a role check. It
// must be applied inside RequireAuth so CurrentUser is already populated:
//
//	mux.HandleFunc("/api/v1/admin/x", middleware.RequireAuth(middleware.RequireRole("admin")(handler)))
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

// CurrentUser returns the authenticated user from request context.
func CurrentUser(r *http.Request) (*models.User, bool) {
	user, ok := r.Context().Value(currentUserKey{}).(*models.User)
	return user, ok
}

// FirebaseToken returns the verified Firebase ID token from request context.
func FirebaseToken(r *http.Request) (*firebaseauth.Token, bool) {
	token, ok := r.Context().Value(firebaseTokenKey{}).(*firebaseauth.Token)
	return token, ok
}

func verifyFirebaseToken(r *http.Request) (*firebaseauth.Token, error) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if authHeader == "" {
		return nil, errAuthHeaderRequired
	}

	idToken := authHeader
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		idToken = strings.TrimSpace(authHeader[7:])
	}
	if idToken == "" {
		return nil, errAuthHeaderRequired
	}

	authClient, err := config.FirebaseAuthClient()
	if err != nil {
		return nil, errAuthServiceUnavailable
	}

	token, err := authClient.VerifyIDToken(r.Context(), idToken)
	if err != nil {
		return nil, errInvalidAuthToken
	}

	return token, nil
}

var (
	errAuthHeaderRequired     = &authError{message: "Authorization header required"}
	errInvalidAuthToken       = &authError{message: "Invalid or expired authorization token"}
	errAuthServiceUnavailable = &authError{message: "Authentication service unavailable"}
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
