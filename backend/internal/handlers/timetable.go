package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
)

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
