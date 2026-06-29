package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

type currentUserKey struct{}

// RequireAuth resolves the current user from the Authorization header and
// stores it in the request context before calling the next handler.
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := currentUserFromRequest(r)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, err.Error())
			return
		}

		ctx := context.WithValue(r.Context(), currentUserKey{}, user)
		next(w, r.WithContext(ctx))
	}
}

// CurrentUser returns the authenticated user from request context.
func CurrentUser(r *http.Request) (*models.User, bool) {
	user, ok := r.Context().Value(currentUserKey{}).(*models.User)
	return user, ok
}

func currentUserFromRequest(r *http.Request) (*models.User, error) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if authHeader == "" {
		return nil, errAuthHeaderRequired
	}

	token := authHeader
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		token = strings.TrimSpace(authHeader[7:])
	}
	if token == "" {
		return nil, errAuthHeaderRequired
	}

	userRepo := &repository.UserRepository{}
	user, err := userRepo.GetUserByFirebaseUID(token)
	if err != nil {
		return nil, errInvalidAuthToken
	}

	return user, nil
}

var (
	errAuthHeaderRequired = &authError{message: "Authorization header required"}
	errInvalidAuthToken   = &authError{message: "Invalid authorization token"}
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