package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

const maxAdImageBytes = 5 << 20

var allowedAdContentTypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
	"image/gif":  ".gif",
}

func toAdImageResponse(ad *models.AdImage) dto.AdImageResponse {
	return dto.AdImageResponse{
		AdID:             ad.AdID,
		AcademicYear:     ad.AcademicYear,
		Term:             ad.Term,
		ImageURL:         ad.ImageURL,
		OriginalFilename: ad.OriginalFilename,
		ContentType:      ad.ContentType,
		FileSize:         ad.FileSize,
		IsActive:         ad.IsActive,
		CreatedAt:        ad.CreatedAt,
		UpdatedAt:        ad.UpdatedAt,
	}
}

// ListAds - GET /api/v1/ads?academic_year=2026&term=spring
func ListAds(w http.ResponseWriter, r *http.Request) {
	academicYearStr := strings.TrimSpace(r.URL.Query().Get("academic_year"))
	term := normalizeAdTerm(r.URL.Query().Get("term"))
	adRepo := &repository.AdRepository{}

	if academicYearStr != "" || term != "" {
		academicYear, err := parseAdAcademicYear(academicYearStr)
		if err != nil || term == "" {
			errorResponse(w, http.StatusBadRequest, "academic_year and term are required")
			return
		}
		ad, err := adRepo.GetActiveAd(academicYear, term)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				successResponse(w, dto.ListAdImagesResponse{Items: []dto.AdImageResponse{}, Count: 0})
				return
			}
			errorResponse(w, http.StatusInternalServerError, "Failed to fetch ad")
			return
		}
		successResponse(w, dto.ListAdImagesResponse{Items: []dto.AdImageResponse{toAdImageResponse(ad)}, Count: 1})
		return
	}

	ads, err := adRepo.ListAds(false)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch ads")
		return
	}

	items := make([]dto.AdImageResponse, len(ads))
	for i := range ads {
		items[i] = toAdImageResponse(&ads[i])
	}
	successResponse(w, dto.ListAdImagesResponse{Items: items, Count: len(items)})
}

// ListAdminAds - GET /api/v1/admin/ads
func ListAdminAds(w http.ResponseWriter, r *http.Request) {
	adRepo := &repository.AdRepository{}
	ads, err := adRepo.ListAds(true)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch ads")
		return
	}

	items := make([]dto.AdImageResponse, len(ads))
	for i := range ads {
		items[i] = toAdImageResponse(&ads[i])
	}
	successResponse(w, dto.ListAdImagesResponse{Items: items, Count: len(items)})
}

// UploadAdminAd - POST /api/v1/admin/ads
func UploadAdminAd(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxAdImageBytes+(1<<20))
	if err := r.ParseMultipartForm(maxAdImageBytes); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid multipart form")
		return
	}

	academicYear, err := parseAdAcademicYear(r.FormValue("academic_year"))
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "academic_year is required")
		return
	}

	term := normalizeAdTerm(r.FormValue("term"))
	if term == "" {
		errorResponse(w, http.StatusBadRequest, "term is required")
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "image file is required")
		return
	}
	defer file.Close()

	ad, err := saveAdUpload(academicYear, term, file, header)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	adRepo := &repository.AdRepository{}
	if err := adRepo.ReplaceActiveAd(ad); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to save ad")
		return
	}

	successResponse(w, toAdImageResponse(ad))
}

// DeleteAdminAd - DELETE /api/v1/admin/ads/{id}
func DeleteAdminAd(w http.ResponseWriter, r *http.Request) {
	adID := extractID(r, "id")
	adRepo := &repository.AdRepository{}
	ad, err := adRepo.DeactivateAd(adID)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Ad not found")
		return
	}
	successResponse(w, toAdImageResponse(ad))
}

func saveAdUpload(academicYear int16, term string, file multipart.File, header *multipart.FileHeader) (*models.AdImage, error) {
	if header.Size <= 0 || header.Size > maxAdImageBytes {
		return nil, fmt.Errorf("image must be 5MB or smaller")
	}

	head := make([]byte, 512)
	n, err := file.Read(head)
	if err != nil {
		return nil, fmt.Errorf("failed to read image")
	}
	if seeker, ok := file.(io.Seeker); ok {
		if _, err := seeker.Seek(0, io.SeekStart); err != nil {
			return nil, fmt.Errorf("failed to reset image")
		}
	}

	contentType := http.DetectContentType(head[:n])
	ext, ok := allowedAdContentTypes[contentType]
	if !ok {
		return nil, fmt.Errorf("image must be PNG, JPG, WebP, or GIF")
	}

	token, err := randomHex(16)
	if err != nil {
		return nil, fmt.Errorf("failed to prepare image")
	}

	filename := fmt.Sprintf("%d-%s-%s%s", academicYear, term, token, ext)
	return saveAdUploadToSupabase(academicYear, term, filename, file, header, contentType)
}

func saveAdUploadToSupabase(academicYear int16, term, filename string, file multipart.File, header *multipart.FileHeader, contentType string) (*models.AdImage, error) {
	body, err := io.ReadAll(io.LimitReader(file, maxAdImageBytes+1))
	if err != nil {
		return nil, fmt.Errorf("failed to read image")
	}
	if len(body) > maxAdImageBytes {
		return nil, fmt.Errorf("image must be 5MB or smaller")
	}

	baseURL := config.SupabaseURL()
	serviceRoleKey := config.SupabaseServiceRoleKey()
	bucket := os.Getenv("SUPABASE_STORAGE_BUCKET")
	if baseURL == "" || serviceRoleKey == "" || bucket == "" {
		return nil, fmt.Errorf("Supabase Storage is not configured")
	}

	objectPath := fmt.Sprintf("ads/%d/%s/%s", academicYear, term, filename)
	url := baseURL + "/storage/v1/object/" + bucket + "/" + objectPath
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to prepare upload")
	}
	req.Header.Set("Authorization", "Bearer "+serviceRoleKey)
	req.Header.Set("apikey", serviceRoleKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "false")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to upload image")
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("failed to upload image")
	}

	publicBaseURL := strings.TrimRight(os.Getenv("SUPABASE_STORAGE_PUBLIC_BASE_URL"), "/")
	if publicBaseURL == "" {
		publicBaseURL = baseURL + "/storage/v1/object/public/" + bucket
	}

	return &models.AdImage{
		AcademicYear:     academicYear,
		Term:             term,
		ImageURL:         publicBaseURL + "/" + objectPath,
		StoragePath:      objectPath,
		OriginalFilename: filepath.Base(header.Filename),
		ContentType:      contentType,
		FileSize:         int64(len(body)),
		IsActive:         true,
	}, nil
}

func normalizeAdTerm(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "spring", "fall", "intensive", "year":
		return value
	default:
		return ""
	}
}

func parseAdAcademicYear(value string) (int16, error) {
	year, err := strconv.ParseInt(strings.TrimSpace(value), 10, 16)
	if err != nil || year < 2000 || year > 2100 {
		return 0, fmt.Errorf("invalid academic_year")
	}
	return int16(year), nil
}

func randomHex(bytesLen int) (string, error) {
	buf := make([]byte, bytesLen)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
