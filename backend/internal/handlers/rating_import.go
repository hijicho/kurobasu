package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/hageruto/kurobasu/internal/csvrating"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

const maxRatingImportCSVBytes = 5 << 20 // 5MB

func toRatingImportRowResponse(row models.RatingImportRow) dto.RatingImportRowResponse {
	return dto.RatingImportRowResponse{
		ImportRowID: row.ImportRowID,
		CourseName:  row.CourseName,
		Score:       row.Score,
	}
}

func toRatingImportBatchResponse(batch *models.RatingImportBatch, includeRows bool) dto.RatingImportBatchResponse {
	resp := dto.RatingImportBatchResponse{
		ImportBatchID:  batch.ImportBatchID,
		SourceFilename: batch.SourceFilename,
		Status:         batch.Status,
		CreatedAt:      batch.CreatedAt,
		UpdatedAt:      batch.UpdatedAt,
		PublishedAt:    batch.PublishedAt,
		RowCount:       len(batch.Rows),
	}
	if includeRows {
		resp.Rows = make([]dto.RatingImportRowResponse, len(batch.Rows))
		for i, row := range batch.Rows {
			resp.Rows[i] = toRatingImportRowResponse(row)
		}
	}
	return resp
}

// CreateAdminRatingImport - POST /api/v1/admin/rating-imports
// multipart form: csv (file). Always targets 総合教養科目 (general-education);
// see csvrating's doc comment for the expected 科目名/おすすめ度 column layout.
func CreateAdminRatingImport(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRatingImportCSVBytes+(1<<20))
	if err := r.ParseMultipartForm(maxRatingImportCSVBytes); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid multipart form")
		return
	}

	file, header, err := r.FormFile("csv")
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "csv file is required")
		return
	}
	defer file.Close()

	parsedRows, err := csvrating.Parse(file)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "CSVの解析に失敗しました: "+err.Error())
		return
	}
	if len(parsedRows) == 0 {
		errorResponse(w, http.StatusBadRequest, "評価データがCSVから見つかりませんでした")
		return
	}

	var createdBy *int64
	if user, ok := middleware.CurrentUser(r); ok {
		createdBy = &user.UserID
	}

	batch := &models.RatingImportBatch{
		SourceFilename:  filepath.Base(header.Filename),
		Status:          "draft",
		CreatedByUserID: createdBy,
	}
	for i, row := range parsedRows {
		batch.Rows = append(batch.Rows, models.RatingImportRow{
			CourseName: row.CourseName,
			Score:      row.Score,
			SortOrder:  i,
		})
	}

	importRepo := &repository.RatingImportRepository{}
	if err := importRepo.CreateBatch(batch); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to save import batch")
		return
	}

	successResponse(w, toRatingImportBatchResponse(batch, true))
}

// ListAdminRatingImports - GET /api/v1/admin/rating-imports
func ListAdminRatingImports(w http.ResponseWriter, r *http.Request) {
	importRepo := &repository.RatingImportRepository{}
	batches, err := importRepo.ListBatches()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch import batches")
		return
	}

	items := make([]dto.RatingImportBatchResponse, len(batches))
	for i := range batches {
		items[i] = toRatingImportBatchResponse(&batches[i], false)
	}
	successResponse(w, dto.ListRatingImportBatchesResponse{Items: items})
}

// GetAdminRatingImport - GET /api/v1/admin/rating-imports/{id}
func GetAdminRatingImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.RatingImportRepository{}
	batch, err := importRepo.GetBatchByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Import batch not found")
		return
	}
	successResponse(w, toRatingImportBatchResponse(batch, true))
}

// UpdateAdminRatingImportRows - PUT /api/v1/admin/rating-imports/{id}/rows
// Replaces every row of a draft batch, e.g. after edits in the admin editor
// screen are saved.
func UpdateAdminRatingImportRows(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.RatingImportRepository{}
	batch, err := importRepo.GetBatchByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Import batch not found")
		return
	}
	if batch.Status == "published" {
		errorResponse(w, http.StatusConflict, "Published batches can no longer be edited")
		return
	}

	var req dto.UpdateRatingImportRowsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	rows := make([]models.RatingImportRow, len(req.Rows))
	for i, in := range req.Rows {
		rows[i] = models.RatingImportRow{
			ImportBatchID: id,
			CourseName:    strings.TrimSpace(in.CourseName),
			Score:         in.Score,
		}
	}

	if err := importRepo.ReplaceRows(id, rows); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to save rows")
		return
	}

	updated, err := importRepo.GetBatchByID(id)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to reload import batch")
		return
	}

	successResponse(w, toRatingImportBatchResponse(updated, true))
}

// PublishAdminRatingImport - POST /api/v1/admin/rating-imports/{id}/publish
// Averages each course's おすすめ度 rows and writes the resulting AA/A/B/C
// rank into subject_ratings so the public course pages pick it up. The
// request body may optionally carry the admin editor's current rows so the
// "save my edits, then publish" flow is one request instead of two.
func PublishAdminRatingImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.RatingImportRepository{}

	var req dto.PublishRatingImportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err != io.EOF {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if len(req.Rows) > 0 {
		rows := make([]models.RatingImportRow, len(req.Rows))
		for i, in := range req.Rows {
			rows[i] = models.RatingImportRow{
				ImportBatchID: id,
				CourseName:    strings.TrimSpace(in.CourseName),
				Score:         in.Score,
			}
		}
		if err := importRepo.ReplaceRows(id, rows); err != nil {
			errorResponse(w, http.StatusInternalServerError, "Failed to save rows")
			return
		}
	}

	published, err := importRepo.PublishBatch(id)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to publish import batch: "+err.Error())
		return
	}
	successResponse(w, toRatingImportBatchResponse(published, true))
}

// DeleteAdminRatingImport - DELETE /api/v1/admin/rating-imports/{id}
func DeleteAdminRatingImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.RatingImportRepository{}
	if err := importRepo.DeleteBatch(id); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to delete import batch")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
