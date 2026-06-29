package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

// ListReviews - GET /api/v1/offerings/{id}/reviews
func ListReviews(w http.ResponseWriter, r *http.Request) {
	offeringID := extractID(r, "id")

	revRepo := &repository.ReviewRepository{}
	reviews, err := revRepo.GetReviewsByOffering(offeringID)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch reviews")
		return
	}

	// コメントを配列で返す
	comments := make([]string, 0, len(reviews))
	for _, rev := range reviews {
		if rev.Comment != "" {
			comments = append(comments, rev.Comment)
		}
	}

	resp := dto.ListReviewsResponse{
		Comments: comments,
		Count:    len(comments),
	}
	successResponse(w, resp)
}

// CreateReview - POST /api/v1/reviews
func CreateReview(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	user, ok := middleware.CurrentUser(r)
	if !ok {
		errorResponse(w, http.StatusUnauthorized, "Authorization header required")
		return
	}

	review := &models.UserReview{
		UserID:     user.UserID,
		OfferingID: req.OfferingID,
		Comment:    req.Comment,
		Status:     models.UserReviewStatusPending,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	revRepo := &repository.ReviewRepository{}
	if err := revRepo.CreateReview(review); err != nil {
		if errors.Is(err, repository.ErrOfferingNotFound) {
			errorResponse(w, http.StatusNotFound, "Offering not found")
			return
		}
		errorResponse(w, http.StatusInternalServerError, "Failed to create review")
		return
	}

	// Return minimal created info (no user details)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": map[string]interface{}{
		"review_id": review.UserReviewID,
		"status":    string(review.Status),
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
	for i, rev := range reviews {
		items[i] = dto.UserReviewResponse{
			ReviewID:   rev.UserReviewID,
			OfferingID: rev.OfferingID,
			Comment:    rev.Comment,
			Status:     string(rev.Status),
			CreatedAt:  rev.CreatedAt,
			UpdatedAt:  rev.UpdatedAt,
		}
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

	successResponse(w, dto.UserReviewResponse{
		ReviewID:   review.UserReviewID,
		OfferingID: review.OfferingID,
		Comment:    review.Comment,
		Status:     string(review.Status),
		CreatedAt:  review.CreatedAt,
		UpdatedAt:  review.UpdatedAt,
	})
}

// GetReview - GET /api/v1/reviews/{id}
// GetReview endpoint removed; use ListReviews or other aggregated endpoints instead.
