package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

var validUserRoles = map[string]struct{}{
	"user":   {},
	"editor": {},
	"admin":  {},
}

var validReviewStatuses = map[string]models.UserReviewStatus{
	"pending":  models.UserReviewStatusPending,
	"approved": models.UserReviewStatusApproved,
}

func toAdminReviewResponse(review *repository.AdminReviewRecord) dto.AdminReviewResponse {
	resp := dto.AdminReviewResponse{
		ReviewID:   review.ReviewID,
		UserID:     review.UserID,
		OfferingID: review.OfferingID,
		Comment:    review.Comment,
		Type:       review.Type,
		Status:     review.Status,
		CreatedAt:  review.CreatedAt,
		UpdatedAt:  review.UpdatedAt,
	}

	if review.UserDisplayName.Valid {
		resp.UserDisplayName = review.UserDisplayName.String
	}
	resp.SubjectTitle = review.SubjectTitle
	resp.InstructorNames = []string(review.InstructorNames)
	resp.AcademicYear = review.AcademicYear
	resp.Term = review.Term

	return resp
}

// ListUsers - GET /api/v1/admin/users
// admin ロールのみアクセス可能（middleware.RequireAuth + middleware.RequireRole("admin")）
func ListUsers(w http.ResponseWriter, r *http.Request) {
	role := strings.TrimSpace(r.URL.Query().Get("role"))
	if role != "" {
		if _, ok := validUserRoles[role]; !ok {
			errorResponse(w, http.StatusBadRequest, "role must be one of: user, editor, admin")
			return
		}
	}
	query := strings.TrimSpace(r.URL.Query().Get("q"))

	userRepo := &repository.UserRepository{}
	users, err := userRepo.ListUsers(role, query)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch users")
		return
	}
	roleCounts64, err := userRepo.CountUsersByRole(query)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to count users")
		return
	}

	items := make([]dto.UserResponse, len(users))
	for i := range users {
		items[i] = toUserResponse(&users[i])
	}
	roleCounts := make(map[string]int, len(roleCounts64))
	for key, value := range roleCounts64 {
		roleCounts[key] = int(value)
	}
	successResponse(w, dto.ListUsersResponse{Items: items, Count: len(items), RoleCounts: roleCounts})
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

// ListAdminReviews - GET /api/v1/admin/reviews
// admin/editor ロールのみアクセス可能
func ListAdminReviews(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status != "" {
		if _, ok := validReviewStatuses[status]; !ok {
			errorResponse(w, http.StatusBadRequest, "status must be one of: pending, approved")
			return
		}
	}

	revRepo := &repository.ReviewRepository{}
	reviews, err := revRepo.ListAdminReviews(status)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}

	items := make([]dto.AdminReviewResponse, len(reviews))
	for i := range reviews {
		items[i] = toAdminReviewResponse(&reviews[i])
	}

	successResponse(w, dto.ListAdminReviewsResponse{Items: items, Count: len(items)})
}

// UpdateReviewStatus - PATCH /api/v1/admin/reviews/{id}/status
// admin/editor ロールのみアクセス可能
func UpdateReviewStatus(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateReviewStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	status, ok := validReviewStatuses[req.Status]
	if !ok {
		errorResponse(w, http.StatusBadRequest, "status must be one of: pending, approved")
		return
	}

	reviewID := extractID(r, "id")
	revRepo := &repository.ReviewRepository{}
	review, err := revRepo.UpdateReviewStatus(reviewID, status)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Review not found")
		return
	}

	successResponse(w, toAdminReviewResponse(review))
}

// DeleteAdminReview - DELETE /api/v1/admin/reviews/{id}
// admin/editor ロールのみアクセス可能。レビュー行を物理削除する。
func DeleteAdminReview(w http.ResponseWriter, r *http.Request) {
	reviewID := extractID(r, "id")
	revRepo := &repository.ReviewRepository{}
	if err := revRepo.DeleteReview(reviewID); err != nil {
		errorResponse(w, http.StatusNotFound, "Review not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
