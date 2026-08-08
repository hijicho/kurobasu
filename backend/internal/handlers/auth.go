package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

func toUserResponse(user *models.User) dto.UserResponse {
	return dto.UserResponse{
		UserID:      user.UserID,
		FirebaseUID: user.FirebaseUID,
		DisplayName: user.DisplayName,
		Role:        user.Role,
		CreatedAt:   user.CreatedAt,
	}
}

// BootstrapUser - POST /api/v1/auth/bootstrap
// Requires a valid Firebase ID token (see middleware.RequireFirebaseToken).
// Creates the DB user profile on first call; idempotent on subsequent calls.
func BootstrapUser(w http.ResponseWriter, r *http.Request) {
	var req dto.BootstrapUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	token, ok := middleware.FirebaseToken(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	userRepo := &repository.UserRepository{}
	existingUser, err := userRepo.GetUserByFirebaseUID(token.UID)
	if err == nil {
		successResponse(w, toUserResponse(existingUser))
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		errorResponse(w, http.StatusInternalServerError, "Failed to look up user")
		return
	}

	displayName := strings.TrimSpace(req.DisplayName)
	if displayName == "" {
		if email, ok := token.Claims["email"].(string); ok && email != "" {
			displayName = email
		} else {
			displayName = "User"
		}
	}

	user := &models.User{
		DisplayName: displayName,
		FirebaseUID: token.UID,
		CreatedAt:   time.Now(),
	}

	if err := userRepo.CreateUser(user); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": toUserResponse(user)})
}

// LogoutUser - POST /api/v1/auth/logout
// Revokes the user's Firebase refresh tokens so previously issued ID tokens
// can no longer be refreshed. The frontend should also call Firebase
// signOut() to clear local session state.
func LogoutUser(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	authClient, err := config.FirebaseAuthClient()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Authentication service unavailable")
		return
	}

	if err := authClient.RevokeRefreshTokens(r.Context(), user.FirebaseUID); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to revoke tokens")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetCurrentUser - GET /api/v1/me
func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	successResponse(w, toUserResponse(user))
}

// UpdateCurrentUser - PATCH /api/v1/me
func UpdateCurrentUser(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	if strings.TrimSpace(req.DisplayName) == "" {
		errorResponse(w, http.StatusBadRequest, "display_name is required")
		return
	}

	user.DisplayName = req.DisplayName
	userRepo := &repository.UserRepository{}
	if err := userRepo.UpdateUser(user); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	successResponse(w, toUserResponse(user))
}
