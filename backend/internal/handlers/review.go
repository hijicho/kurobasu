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

var validReviewTypes = map[string]models.UserReviewType{
	"pros":   models.UserReviewTypePros,
	"cons":   models.UserReviewTypeCons,
	"others": models.UserReviewTypeOthers,
}

// CreateReview - POST /api/v1/reviews
// 1回の投稿で pros/cons/others のいずれか1行を作成する
func CreateReview(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	reviewType, ok := validReviewTypes[strings.TrimSpace(req.Type)]
	if !ok {
		errorResponse(w, http.StatusBadRequest, "type must be one of: pros, cons, others")
		return
	}
	comment := strings.TrimSpace(req.Comment)
	if comment == "" {
		errorResponse(w, http.StatusBadRequest, "comment is required")
		return
	}

	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}

	now := time.Now()
	review := &models.UserReview{
		UserID:     userID,
		OfferingID: req.OfferingID,
		Comment:    comment,
		Type:       reviewType,
		Status:     models.UserReviewStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	revRepo := &repository.ReviewRepository{}
	if err := revRepo.CreateReviews([]*models.UserReview{review}); err != nil {
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
		"type":      string(review.Type),
		"status":    string(models.UserReviewStatusPending),
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
