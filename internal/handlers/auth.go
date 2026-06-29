package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

// BootstrapUser - POST /api/v1/auth/bootstrap
func BootstrapUser(w http.ResponseWriter, r *http.Request) {
	var req dto.BootstrapUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	dummyFirebaseUID := "test_user_" + strconv.FormatInt(time.Now().UnixNano(), 10)

	userRepo := &repository.UserRepository{}
	existingUser, _ := userRepo.GetUserByFirebaseUID(dummyFirebaseUID)
	if existingUser != nil {
		response := dto.UserResponse{
			UserID:      existingUser.UserID,
			DisplayName: existingUser.DisplayName,
			CreatedAt:   existingUser.CreatedAt,
		}
		successResponse(w, response)
		return
	}

	user := &models.User{
		DisplayName: req.DisplayName,
		FirebaseUID: dummyFirebaseUID,
		CreatedAt:   time.Now(),
	}

	if err := userRepo.CreateUser(user); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	response := dto.UserResponse{
		UserID:      user.UserID,
		DisplayName: user.DisplayName,
		CreatedAt:   user.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": response})
}

// GetCurrentUser - GET /api/v1/me
func GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	response := dto.UserResponse{
		UserID:      user.UserID,
		DisplayName: user.DisplayName,
		CreatedAt:   user.CreatedAt,
	}
	successResponse(w, response)
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

	response := dto.UserResponse{
		UserID:      user.UserID,
		DisplayName: user.DisplayName,
		CreatedAt:   user.CreatedAt,
	}
	successResponse(w, response)
}
