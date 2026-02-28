package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
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

	items := make([]dto.ReviewResponse, len(reviews))
	for i, rev := range reviews {
		items[i] = dto.ReviewResponse{
			ReviewID:  rev.ReviewID,
			MdURL:     rev.MdURL,
			Status:    rev.Status,
			CreatedAt: rev.CreatedAt,
			Author: dto.UserResponse{
				UserID:      0,
				DisplayName: "Anonymous",
			},
		}
	}

	successResponse(w, dto.ListResponse{Items: items})
}

// CreateReview - POST /api/v1/reviews
func CreateReview(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	review := &models.Review{
		OfferingID:  req.OfferingID,
		MdURL:       req.MdURL,
		Status:      req.Status,
		ReviewCount: 0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	revRepo := &repository.ReviewRepository{}
	if err := revRepo.CreateReview(review); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to create review")
		return
	}

	response := dto.ReviewResponse{
		ReviewID:  review.ReviewID,
		MdURL:     review.MdURL,
		Status:    review.Status,
		CreatedAt: review.CreatedAt,
		Author: dto.UserResponse{
			UserID:      0,
			DisplayName: "Anonymous",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": response})
}

// GetReview - GET /api/v1/reviews/{id}
func GetReview(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")

	revRepo := &repository.ReviewRepository{}
	review, err := revRepo.GetReviewByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Review not found")
		return
	}

	response := dto.ReviewResponse{
		ReviewID:  review.ReviewID,
		MdURL:     review.MdURL,
		Status:    review.Status,
		CreatedAt: review.CreatedAt,
		Author: dto.UserResponse{
			UserID:      0,
			DisplayName: "Anonymous",
		},
	}

	successResponse(w, response)
}
