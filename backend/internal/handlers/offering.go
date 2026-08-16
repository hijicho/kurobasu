package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

func toOfferingResponse(off models.Offering, meetings []models.Meeting, rating repository.OfferingRatingSummary) dto.OfferingResponse {
	meetingDTOs := make([]dto.MeetingResponse, len(meetings))
	for j, m := range meetings {
		meetingDTOs[j] = dto.MeetingResponse{
			Day:       m.Day,
			Period:    m.Period,
			Classroom: m.Classroom,
		}
	}

	var ratingAverage *float64
	if rating.SampleCount > 0 {
		value := rating.AverageScore
		ratingAverage = &value
	}
	var ratingRank *string
	if rating.SampleCount > 0 {
		rank := ratingRankForScore(rating.AverageScore)
		ratingRank = &rank
	}

	return dto.OfferingResponse{
		OfferingID:      off.OfferingID,
		Subject:         dto.SubjectResponse{SubjectID: off.Subject.SubjectID, Title: off.Subject.Title},
		AcademicYear:    off.AcademicYear,
		Term:            off.Term,
		Modality:        off.Modality,
		CourseCode:      off.CourseCode,
		Note:            off.Note,
		InstructorNames: off.InstructorNames,
		Meetings:        meetingDTOs,
		RatingAverage:   ratingAverage,
		RatingCount:     rating.SampleCount,
		RatingRank:      ratingRank,
	}
}

func ratingRankForScore(score float64) string {
	switch {
	case score >= 4:
		return "AA"
	case score >= 2:
		return "A"
	case score >= 1:
		return "B"
	default:
		return "C"
	}
}

// ListOfferingsByCategory - GET /api/v1/categories/{slug}/offerings
func ListOfferingsByCategory(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	academicYearStr := r.URL.Query().Get("academic_year")
	term := normalizeSemesterTerm(r.URL.Query().Get("term"))

	if academicYearStr == "" || term == "" {
		errorResponse(w, http.StatusBadRequest, "academic_year and term are required")
		return
	}

	academicYear, err := strconv.ParseInt(academicYearStr, 10, 16)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid academic_year")
		return
	}

	catRepo := &repository.CategoryRepository{}
	category, err := catRepo.GetCategoryBySlug(slug)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Category not found")
		return
	}

	offRepo := &repository.OfferingRepository{}
	offerings, err := offRepo.GetOfferingsByCategory(category.CategoryID, int16(academicYear), term)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch offerings")
		return
	}

	offeringIDs := make([]int64, len(offerings))
	for i, off := range offerings {
		offeringIDs[i] = off.OfferingID
	}
	meetRepo := &repository.MeetingRepository{}
	meetingsByOffering, err := meetRepo.GetMeetingsByOfferingIDs(offeringIDs)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch meetings")
		return
	}

	ratingRepo := &repository.OfferingRatingRepository{}
	ratingsByOffering, err := ratingRepo.GetSummariesByOfferingIDs(offeringIDs)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch ratings")
		return
	}

	items := make([]dto.OfferingResponse, len(offerings))
	for i, off := range offerings {
		items[i] = toOfferingResponse(off, meetingsByOffering[off.OfferingID], ratingsByOffering[off.OfferingID])
	}

	successResponse(w, dto.ListResponse{Items: items})
}

// GetOffering - GET /api/v1/offerings/{id}
func GetOffering(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")

	offRepo := &repository.OfferingRepository{}
	offering, err := offRepo.GetOfferingByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Offering not found")
		return
	}

	meetRepo := &repository.MeetingRepository{}
	meetings, _ := meetRepo.GetMeetingsByOffering(offering.OfferingID)

	ratingRepo := &repository.OfferingRatingRepository{}
	ratingsByOffering, _ := ratingRepo.GetSummariesByOfferingIDs([]int64{offering.OfferingID})

	successResponse(w, toOfferingResponse(*offering, meetings, ratingsByOffering[offering.OfferingID]))
}

// CreateOfferingRating - POST /api/v1/offerings/{id}/ratings
func CreateOfferingRating(w http.ResponseWriter, r *http.Request) {
	offeringID := extractID(r, "id")

	var req dto.CreateOfferingRatingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Score < 1 || req.Score > 5 {
		errorResponse(w, http.StatusBadRequest, "score must be between 1 and 5")
		return
	}

	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}

	ratingRepo := &repository.OfferingRatingRepository{}
	summary, err := ratingRepo.SaveRating(offeringID, userID, req.Score)
	if err != nil {
		if errors.Is(err, repository.ErrOfferingNotFound) {
			errorResponse(w, http.StatusNotFound, "Offering not found")
			return
		}
		errorResponse(w, http.StatusInternalServerError, "Failed to save rating")
		return
	}

	average := summary.AverageScore
	rank := ratingRankForScore(summary.AverageScore)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": dto.OfferingRatingResponse{
		OfferingID:    offeringID,
		RatingAverage: &average,
		RatingCount:   summary.SampleCount,
		RatingRank:    &rank,
	}})
}
