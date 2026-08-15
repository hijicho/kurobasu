package handlers

import (
	"net/http"
	"strconv"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

func toOfferingResponse(off models.Offering, meetings []models.Meeting) dto.OfferingResponse {
	meetingDTOs := make([]dto.MeetingResponse, len(meetings))
	for j, m := range meetings {
		meetingDTOs[j] = dto.MeetingResponse{
			Day:       m.Day,
			Period:    m.Period,
			Classroom: m.Classroom,
		}
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

	meetRepo := &repository.MeetingRepository{}
	items := make([]dto.OfferingResponse, len(offerings))
	for i, off := range offerings {
		meetings, _ := meetRepo.GetMeetingsByOffering(off.OfferingID)
		items[i] = toOfferingResponse(off, meetings)
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

	successResponse(w, toOfferingResponse(*offering, meetings))
}
