package handlers

import (
	"net/http"
	"time"
)

// GetDefaultAcademicYear - GET /api/v1/meta/default-academic-year
func GetDefaultAcademicYear(w http.ResponseWriter, r *http.Request) {
	year := time.Now().Year()
	successResponse(w, map[string]interface{}{"academic_year": year})
}
