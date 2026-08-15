package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/models"
)

const siteSettingsID int16 = 1

func toSiteSettingsResponse(settings *models.SiteSettings) dto.SiteSettingsResponse {
	return dto.SiteSettingsResponse{
		DefaultAcademicYear: settings.DefaultAcademicYear,
		DefaultTerm:         settings.DefaultTerm,
		UpdatedAt:           settings.UpdatedAt,
	}
}

func getSiteSettingsModel() (*models.SiteSettings, error) {
	settings := &models.SiteSettings{
		SettingsID:          siteSettingsID,
		DefaultAcademicYear: int16(time.Now().Year()),
		DefaultTerm:         "spring",
		UpdatedAt:           time.Now(),
	}
	if err := config.DB.
		Where(models.SiteSettings{SettingsID: siteSettingsID}).
		FirstOrCreate(settings).Error; err != nil {
		return nil, err
	}
	return settings, nil
}

func normalizeTerm(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "spring", "fall", "intensive", "year":
		return value
	default:
		return ""
	}
}

// GetSiteSettings - GET /api/v1/meta/site-settings
func GetSiteSettings(w http.ResponseWriter, r *http.Request) {
	settings, err := getSiteSettingsModel()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch site settings")
		return
	}
	successResponse(w, toSiteSettingsResponse(settings))
}

// UpdateSiteSettings - PATCH /api/v1/admin/site-settings
func UpdateSiteSettings(w http.ResponseWriter, r *http.Request) {
	var req dto.UpdateSiteSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.DefaultAcademicYear < 2000 || req.DefaultAcademicYear > 2100 {
		errorResponse(w, http.StatusBadRequest, "default_academic_year must be between 2000 and 2100")
		return
	}
	term := normalizeTerm(req.DefaultTerm)
	if term == "" {
		errorResponse(w, http.StatusBadRequest, "default_term must be one of: spring, fall, intensive, year")
		return
	}

	settings := &models.SiteSettings{
		SettingsID:          siteSettingsID,
		DefaultAcademicYear: req.DefaultAcademicYear,
		DefaultTerm:         term,
		UpdatedAt:           time.Now(),
	}
	if err := config.DB.Save(settings).Error; err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to update site settings")
		return
	}

	successResponse(w, toSiteSettingsResponse(settings))
}
