package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

func toUserReviewResponse(rev *models.UserReview) dto.UserReviewResponse {
	return dto.UserReviewResponse{
		ReviewID:   rev.UserReviewID,
		OfferingID: rev.OfferingID,
		Comment:    rev.Comment,
		Type:       string(rev.Type),
		Status:     string(rev.Status),
		CreatedAt:  rev.CreatedAt,
		UpdatedAt:  rev.UpdatedAt,
	}
}

// ListReviews - GET /api/v1/offerings/{id}/reviews
func ListReviews(w http.ResponseWriter, r *http.Request) {
	offeringID := extractID(r, "id")

	revRepo := &repository.ReviewRepository{}
	reviews, err := revRepo.GetReviewsByOffering(offeringID)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}

	resp := dto.ListReviewsResponse{
		Pros:   []string{},
		Cons:   []string{},
		Others: []string{},
	}
	for _, rev := range reviews {
		switch rev.Type {
		case models.UserReviewTypePros:
			resp.Pros = append(resp.Pros, rev.Comment)
		case models.UserReviewTypeCons:
			resp.Cons = append(resp.Cons, rev.Comment)
		default:
			resp.Others = append(resp.Others, rev.Comment)
		}
	}
	resp.Count = len(reviews)

	successResponse(w, resp)
}

// CreateReview - POST /api/v1/reviews
// 1回の投稿から pros/cons（必須）と others（任意）の複数行を作成する
func CreateReview(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	pros := strings.TrimSpace(req.Pros)
	cons := strings.TrimSpace(req.Cons)
	others := strings.TrimSpace(req.Others)

	if pros == "" || cons == "" {
		errorResponse(w, http.StatusBadRequest, "pros and cons are required")
		return
	}

	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}

	now := time.Now()
	newRow := func(reviewType models.UserReviewType, comment string) *models.UserReview {
		return &models.UserReview{
			UserID:     userID,
			OfferingID: req.OfferingID,
			Comment:    comment,
			Type:       reviewType,
			Status:     models.UserReviewStatusPending,
			CreatedAt:  now,
			UpdatedAt:  now,
		}
	}

	reviews := []*models.UserReview{
		newRow(models.UserReviewTypePros, pros),
		newRow(models.UserReviewTypeCons, cons),
	}
	if others != "" {
		reviews = append(reviews, newRow(models.UserReviewTypeOthers, others))
	}

	revRepo := &repository.ReviewRepository{}
	if err := revRepo.CreateReviews(reviews); err != nil {
		if errors.Is(err, repository.ErrOfferingNotFound) {
			errorResponse(w, http.StatusNotFound, "Offering not found")
			return
		}
		errorResponse(w, http.StatusInternalServerError, "Failed to create review")
		return
	}

	reviewIDs := make([]int64, len(reviews))
	for i, rev := range reviews {
		reviewIDs[i] = rev.UserReviewID
	}

	// Return minimal created info (no user details)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": map[string]interface{}{
		"review_ids": reviewIDs,
		"status":     string(models.UserReviewStatusPending),
	}})
}

// ListMyReviews - GET /api/v1/me/reviews
func ListMyReviews(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	revRepo := &repository.ReviewRepository{}
	reviews, err := revRepo.GetReviewsByUser(user.UserID)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}

	items := make([]dto.UserReviewResponse, len(reviews))
	for i := range reviews {
		items[i] = toUserReviewResponse(&reviews[i])
	}

	successResponse(w, dto.ListUserReviewsResponse{Reviews: items, Count: len(items)})
}

// GetMyReview - GET /api/v1/me/reviews/{id}
func GetMyReview(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	reviewID := extractID(r, "id")
	revRepo := &repository.ReviewRepository{}
	review, err := revRepo.GetReviewByIDForUser(user.UserID, reviewID)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Review not found")
		return
	}

	successResponse(w, toUserReviewResponse(review))
}

// GetReview - GET /api/v1/reviews/{id}
// GetReview endpoint removed; use ListReviews or other aggregated endpoints instead.
