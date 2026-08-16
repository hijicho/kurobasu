package handlers

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"
	"sync"

	"github.com/hageruto/kurobasu/internal/csvtimetable"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/internal/sheets"
	"github.com/hageruto/kurobasu/models"
)

const maxTimetableImportCSVBytes = 5 << 20 // 5MB

// supportedImportCategorySlug is the default category when none is given.
// CSV import works for any category (see csvtimetable's doc comment for the
// shared column layout the parser expects).
const supportedImportCategorySlug = "general-education"

var (
	sheetsProviderOnce sync.Once
	sheetsProviderInst sheets.Provider
)

// sheetsProvider is resolved lazily (not at package init) so it reads
// environment variables after main() has loaded the .env file.
func sheetsProviderFor() sheets.Provider {
	sheetsProviderOnce.Do(func() {
		sheetsProviderInst = sheets.NewProviderFromEnv()
	})
	return sheetsProviderInst
}

func toTimetableImportRowResponse(row models.TimetableImportRow) dto.TimetableImportRowResponse {
	return dto.TimetableImportRowResponse{
		ImportRowID: row.ImportRowID,
		Day:         row.Day,
		Period:      row.Period,
		CourseCode:  row.CourseCode,
		CourseName:  row.CourseName,
		Instructor:  row.Instructor,
		Classroom:   row.Classroom,
		Note:        row.Note,
	}
}

func toTimetableImportBatchResponse(batch *models.TimetableImportBatch, includeRows bool) dto.TimetableImportBatchResponse {
	resp := dto.TimetableImportBatchResponse{
		ImportBatchID:  batch.ImportBatchID,
		CategorySlug:   batch.CategorySlug,
		AcademicYear:   batch.AcademicYear,
		Term:           batch.Term,
		SourceFilename: batch.SourceFilename,
		Status:         batch.Status,
		SheetURL:       batch.SheetURL,
		SheetProvider:  sheetsProviderFor().Name(),
		CreatedAt:      batch.CreatedAt,
		UpdatedAt:      batch.UpdatedAt,
		PublishedAt:    batch.PublishedAt,
		RowCount:       len(batch.Rows),
	}
	if includeRows {
		resp.Rows = make([]dto.TimetableImportRowResponse, len(batch.Rows))
		for i, row := range batch.Rows {
			resp.Rows[i] = toTimetableImportRowResponse(row)
		}
	}
	return resp
}

// CreateAdminTimetableImport - POST /api/v1/admin/timetable-imports
// multipart form: csv (file), academic_year, term, category_slug (optional, defaults to general-education)
func CreateAdminTimetableImport(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxTimetableImportCSVBytes+(1<<20))
	if err := r.ParseMultipartForm(maxTimetableImportCSVBytes); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid multipart form")
		return
	}

	academicYear, err := parseAdAcademicYear(r.FormValue("academic_year"))
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "academic_year is required")
		return
	}
	term := normalizeSemesterTerm(r.FormValue("term"))
	if term == "" {
		errorResponse(w, http.StatusBadRequest, "term is required")
		return
	}

	categorySlug := strings.TrimSpace(r.FormValue("category_slug"))
	if categorySlug == "" {
		categorySlug = supportedImportCategorySlug
	}
	categoryRepo := &repository.CategoryRepository{}
	if _, err := categoryRepo.GetCategoryBySlug(categorySlug); err != nil {
		errorResponse(w, http.StatusBadRequest, "Unknown category_slug: "+categorySlug)
		return
	}

	file, header, err := r.FormFile("csv")
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "csv file is required")
		return
	}
	defer file.Close()

	parsedRows, err := csvtimetable.Parse(file, term)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "CSVの解析に失敗しました: "+err.Error())
		return
	}
	if len(parsedRows) == 0 {
		errorResponse(w, http.StatusBadRequest, "時間割データがCSVから見つかりませんでした")
		return
	}

	// Optional second file: 集中講義のCSV (courses with no fixed weekly
	// slot, scheduled on specific calendar dates instead). Not having one
	// is fine — the main timetable import still succeeds without it.
	if intensiveFile, _, err := r.FormFile("intensive_csv"); err == nil {
		defer intensiveFile.Close()
		intensiveRows, err := csvtimetable.Parse(intensiveFile, term)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, "集中講義のCSVの解析に失敗しました: "+err.Error())
			return
		}
		parsedRows = csvtimetable.MergeIntensiveRows(parsedRows, intensiveRows)
	}

	var createdBy *int64
	if user, ok := middleware.CurrentUser(r); ok {
		createdBy = &user.UserID
	}

	batch := &models.TimetableImportBatch{
		CategorySlug:    categorySlug,
		AcademicYear:    academicYear,
		Term:            term,
		SourceFilename:  filepath.Base(header.Filename),
		Status:          "draft",
		CreatedByUserID: createdBy,
	}
	for i, row := range parsedRows {
		batch.Rows = append(batch.Rows, models.TimetableImportRow{
			Day: row.Day, Period: row.Period,
			CourseCode: row.CourseCode, CourseName: row.CourseName,
			Instructor: row.Instructor, Classroom: row.Classroom, Note: row.Note,
			SortOrder: i,
		})
	}

	importRepo := &repository.TimetableImportRepository{}
	if err := importRepo.CreateBatch(batch); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to save import batch")
		return
	}

	if url, err := sheetsProviderFor().EditLink(batch, batch.Rows); err == nil {
		batch.SheetURL = url
		_ = importRepo.UpdateSheetURL(batch.ImportBatchID, url)
	}

	successResponse(w, toTimetableImportBatchResponse(batch, true))
}

// ListAdminTimetableImports - GET /api/v1/admin/timetable-imports?category_slug=general-education
func ListAdminTimetableImports(w http.ResponseWriter, r *http.Request) {
	categorySlug := strings.TrimSpace(r.URL.Query().Get("category_slug"))
	if categorySlug == "" {
		categorySlug = supportedImportCategorySlug
	}

	importRepo := &repository.TimetableImportRepository{}
	batches, err := importRepo.ListBatches(categorySlug)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch import batches")
		return
	}

	items := make([]dto.TimetableImportBatchResponse, len(batches))
	for i := range batches {
		items[i] = toTimetableImportBatchResponse(&batches[i], false)
	}
	successResponse(w, dto.ListTimetableImportBatchesResponse{Items: items})
}

// GetAdminTimetableImport - GET /api/v1/admin/timetable-imports/{id}
func GetAdminTimetableImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.TimetableImportRepository{}
	batch, err := importRepo.GetBatchByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Import batch not found")
		return
	}
	successResponse(w, toTimetableImportBatchResponse(batch, true))
}

// UpdateAdminTimetableImportRows - PUT /api/v1/admin/timetable-imports/{id}/rows
// Replaces every row of a draft batch, e.g. after edits in the admin
// spreadsheet-style editor are saved.
func UpdateAdminTimetableImportRows(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.TimetableImportRepository{}
	batch, err := importRepo.GetBatchByID(id)
	if err != nil {
		errorResponse(w, http.StatusNotFound, "Import batch not found")
		return
	}
	if batch.Status == "published" {
		errorResponse(w, http.StatusConflict, "Published batches can no longer be edited")
		return
	}

	var req dto.UpdateTimetableImportRowsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	rows := make([]models.TimetableImportRow, len(req.Rows))
	for i, in := range req.Rows {
		rows[i] = models.TimetableImportRow{
			ImportBatchID: id,
			Day:           in.Day,
			Period:        in.Period,
			CourseCode:    strings.TrimSpace(in.CourseCode),
			CourseName:    strings.TrimSpace(in.CourseName),
			Instructor:    strings.TrimSpace(in.Instructor),
			Classroom:     strings.TrimSpace(in.Classroom),
			Note:          strings.TrimSpace(in.Note),
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

	if url, err := sheetsProviderFor().EditLink(updated, updated.Rows); err == nil && url != updated.SheetURL {
		updated.SheetURL = url
		_ = importRepo.UpdateSheetURL(id, url)
	}

	successResponse(w, toTimetableImportBatchResponse(updated, true))
}

// PublishAdminTimetableImport - POST /api/v1/admin/timetable-imports/{id}/publish
// Writes the batch's rows into categories/subjects/offerings/meetings so
// the public course pages pick them up.
func PublishAdminTimetableImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.TimetableImportRepository{}
	published, err := importRepo.PublishBatch(id)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to publish import batch: "+err.Error())
		return
	}
	successResponse(w, toTimetableImportBatchResponse(published, true))
}

// DeleteAdminTimetableImport - DELETE /api/v1/admin/timetable-imports/{id}
func DeleteAdminTimetableImport(w http.ResponseWriter, r *http.Request) {
	id := extractID(r, "id")
	importRepo := &repository.TimetableImportRepository{}
	if err := importRepo.DeleteBatch(id); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to delete import batch")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
