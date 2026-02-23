package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

// Helper functions
func successResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"data": data})
}

func errorResponse(w http.ResponseWriter, statusCode int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
}

// Extract ID from URL path
func extractID(r *http.Request, paramName string) int64 {
	idStr := r.PathValue(paramName)
	id, _ := strconv.ParseInt(idStr, 10, 64)
	return id
}

// Categories ============================================

// ListCategories - GET /api/v1/categories
func ListCategories(w http.ResponseWriter, r *http.Request) {
	repo := &repository.CategoryRepository{}
	categories, err := repo.GetAllCategories()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	items := make([]dto.CategoryResponse, len(categories))
	for i, cat := range categories {
		items[i] = dto.CategoryResponse{
			CategoryID: cat.CategoryID,
			Slug:       cat.Slug,
			Name:       cat.Name,
			SortOrder:  cat.SortOrder,
		}
	}

	successResponse(w, dto.ListResponse{Items: items})
}

// Offerings =============================================

// ListOfferingsByCategory - GET /api/v1/categories/{slug}/offerings
func ListOfferingsByCategory(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	academicYearStr := r.URL.Query().Get("academic_year")
	term := r.URL.Query().Get("term")

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

	meetRepo := &repository.MeetingRepository{}
	items := make([]dto.OfferingResponse, len(offerings))
	for i, off := range offerings {
		meetings, _ := meetRepo.GetMeetingsByOffering(off.OfferingID)
		meetingDTOs := make([]dto.MeetingResponse, len(meetings))
		for j, m := range meetings {
			meetingDTOs[j] = dto.MeetingResponse{
				Day:    m.Day,
				Period: m.Period,
			}
		}

		items[i] = dto.OfferingResponse{
			OfferingID:      off.OfferingID,
			Subject:         dto.SubjectResponse{SubjectID: off.Subject.SubjectID, Title: off.Subject.Title},
			AcademicYear:    off.AcademicYear,
			Term:            off.Term,
			Modality:        off.Modality,
			InstructorNames: off.InstructorNames,
			Meetings:        meetingDTOs,
		}
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
	meetingDTOs := make([]dto.MeetingResponse, len(meetings))
	for j, m := range meetings {
		meetingDTOs[j] = dto.MeetingResponse{
			Day:    m.Day,
			Period: m.Period,
		}
	}

	response := dto.OfferingResponse{
		OfferingID:      offering.OfferingID,
		Subject:         dto.SubjectResponse{SubjectID: offering.Subject.SubjectID, Title: offering.Subject.Title},
		AcademicYear:    offering.AcademicYear,
		Term:            offering.Term,
		Modality:        offering.Modality,
		InstructorNames: offering.InstructorNames,
		Meetings:        meetingDTOs,
	}

	successResponse(w, response)
}

// Reviews ================================================

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

// Auth ==================================================

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
	errorResponse(w, http.StatusUnauthorized, "Authorization header required")
}

// UpdateCurrentUser - PATCH /api/v1/me
func UpdateCurrentUser(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	errorResponse(w, http.StatusUnauthorized, "Authorization header required")
}

// Timetables ============================================

// CreateTimetable - POST /api/v1/timetables
func CreateTimetable(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateTimetableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	errorResponse(w, http.StatusUnauthorized, "Authorization header required")
}

// GetTimetable - GET /api/v1/timetables/{id}
func GetTimetable(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")

	ttRepo := &repository.TimetableRepository{}
	timetable, err := ttRepo.GetTimetableByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Timetable not found")
		return
	}

	items := make([]dto.TimetableItemResponse, len(timetable.Items))
	for i, item := range timetable.Items {
		items[i] = dto.TimetableItemResponse{
			OfferingID: item.OfferingID,
			DayOfWeek:  item.DayOfWeek,
			Period:     item.Period,
			IsSelected: item.IsSelected,
		}
	}

	response := dto.TimetableResponse{
		TimetableID: timetable.TimetableID,
		UserID:      timetable.UserID,
		Title:       timetable.Title,
		Year:        timetable.Year,
		Term:        timetable.Term,
		IsPublic:    timetable.IsPublic,
		CreatedAt:   timetable.CreatedAt,
		Items:       items,
	}

	successResponse(w, response)
}

// UpdateTimetable - PATCH /api/v1/timetables/{id}
func UpdateTimetable(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")

	var req dto.UpdateTimetableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	ttRepo := &repository.TimetableRepository{}
	timetable, err := ttRepo.GetTimetableByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Timetable not found")
		return
	}

	if req.Title != nil {
		timetable.Title = *req.Title
	}

	if req.IsPublic != nil {
		timetable.IsPublic = *req.IsPublic
	}

	if err := ttRepo.UpdateTimetable(timetable); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to update timetable")
		return
	}

	items := make([]dto.TimetableItemResponse, len(timetable.Items))
	for i, item := range timetable.Items {
		items[i] = dto.TimetableItemResponse{
			OfferingID: item.OfferingID,
			DayOfWeek:  item.DayOfWeek,
			Period:     item.Period,
			IsSelected: item.IsSelected,
		}
	}

	response := dto.TimetableResponse{
		TimetableID: timetable.TimetableID,
		UserID:      timetable.UserID,
		Title:       timetable.Title,
		Year:        timetable.Year,
		Term:        timetable.Term,
		IsPublic:    timetable.IsPublic,
		CreatedAt:   timetable.CreatedAt,
		Items:       items,
	}

	successResponse(w, response)
}

// Metadata ==============================================

// GetDefaultAcademicYear - GET /api/v1/meta/default-academic-year
func GetDefaultAcademicYear(w http.ResponseWriter, r *http.Request) {
	year := time.Now().Year()
	successResponse(w, map[string]interface{}{"academic_year": year})
}
