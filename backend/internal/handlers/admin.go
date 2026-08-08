package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
)

var validUserRoles = map[string]struct{}{
	"user":   {},
	"editor": {},
	"admin":  {},
}

// ListUsers - GET /api/v1/admin/users
// admin ロールのみアクセス可能（middleware.RequireAuth + middleware.RequireRole("admin")）
func ListUsers(w http.ResponseWriter, r *http.Request) {
	userRepo := &repository.UserRepository{}
	users, err := userRepo.ListUsers()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}

	items := make([]dto.UserResponse, len(users))
	for i := range users {
		items[i] = toUserResponse(&users[i])
	}
	successResponse(w, dto.ListUsersResponse{Items: items})
}

// UpdateUserRole - PATCH /api/v1/admin/users/{id}/role
// admin ロールのみアクセス可能（middleware.RequireAuth + middleware.RequireRole("admin")）
func UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateUserRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if _, ok := validUserRoles[req.Role]; !ok {
		errorResponse(w, http.StatusBadRequest, "role must be one of: user, editor, admin")
		return
	}

	userID := extractID(r, "id")
	userRepo := &repository.UserRepository{}
	user, err := userRepo.GetUserByID(userID)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "User not found")
		return
	}

	user.Role = req.Role
	if err := userRepo.UpdateUser(user); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to update user role")
		return
	}

	successResponse(w, toUserResponse(user))
}
