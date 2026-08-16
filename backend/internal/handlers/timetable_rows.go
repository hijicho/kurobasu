package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/hageruto/kurobasu/internal/csvtimetable"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
)

// resolveTimetableScope reads+validates the (category_slug, academic_year,
// term) query/form params shared by every timetable-rows endpoint.
func resolveTimetableScope(categorySlugRaw, academicYearRaw, termRaw string) (categoryID int64, academicYear int16, term string, err error) {
	categorySlug := strings.TrimSpace(categorySlugRaw)
	if categorySlug == "" {
		return 0, 0, "", errMissingCategorySlug
	}
	catRepo := &repository.CategoryRepository{}
	category, err := catRepo.GetCategoryBySlug(categorySlug)
	if err != nil {
		return 0, 0, "", errUnknownCategorySlug
	}

	academicYear, err = parseAdAcademicYear(academicYearRaw)
	if err != nil {
		return 0, 0, "", errMissingAcademicYear
	}

	term = normalizeSemesterTerm(termRaw)
	if term == "" {
		return 0, 0, "", errMissingTerm
	}

	return category.CategoryID, academicYear, term, nil
}

var (
	errMissingCategorySlug = &fieldError{"category_slug is required"}
	errUnknownCategorySlug = &fieldError{"Unknown category_slug"}
	errMissingAcademicYear = &fieldError{"academic_year is required"}
	errMissingTerm         = &fieldError{"term is required"}
)

type fieldError struct{ message string }

func (e *fieldError) Error() string { return e.message }

// buildTimetableRowsResponse reads the current live offerings+meetings for a
// scope and flattens them into editable rows (one row per meeting, or one
// row with no day/period for an offering with none). Reused after a write
// (import/save) instead of trying to reconstruct the response purely from
// what was just written, since the Subject each offering ended up pointing
// at can be an existing shared subject, not necessarily one this call
// created — re-reading is simpler and unambiguously correct, and it's just
// two bulk queries regardless of row count, not a per-row cost.
func buildTimetableRowsResponse(categoryID int64, academicYear int16, term string) (dto.ListTimetableRowsResponse, error) {
	offRepo := &repository.OfferingRepository{}
	offerings, err := offRepo.GetOfferingsByCategory(categoryID, academicYear, term)
	if err != nil {
		return dto.ListTimetableRowsResponse{}, err
	}

	offeringIDs := make([]int64, len(offerings))
	for i, off := range offerings {
		offeringIDs[i] = off.OfferingID
	}
	meetRepo := &repository.MeetingRepository{}
	meetingsByOffering, err := meetRepo.GetMeetingsByOfferingIDs(offeringIDs)
	if err != nil {
		return dto.ListTimetableRowsResponse{}, err
	}

	items := make([]dto.TimetableRowResponse, 0, len(offerings))
	for _, off := range offerings {
		instructor := ""
		if len(off.InstructorNames) > 0 {
			instructor = off.InstructorNames[0]
		}

		meetings := meetingsByOffering[off.OfferingID]
		if len(meetings) == 0 {
			items = append(items, dto.TimetableRowResponse{
				OfferingID: off.OfferingID,
				CourseCode: off.CourseCode,
				CourseName: off.Subject.Title,
				Instructor: instructor,
				Note:       off.Note,
			})
			continue
		}
		for _, m := range meetings {
			items = append(items, dto.TimetableRowResponse{
				OfferingID: off.OfferingID,
				Day:        m.Day,
				Period:     m.Period,
				CourseCode: off.CourseCode,
				CourseName: off.Subject.Title,
				Instructor: instructor,
				Classroom:  m.Classroom,
				Note:       off.Note,
			})
		}
	}

	return dto.ListTimetableRowsResponse{Items: items}, nil
}

// ListAdminTimetableRows - GET /api/v1/admin/timetable-rows?category_slug=&academic_year=&term=
// Returns the current live offerings+meetings for a scope, flattened into
// editable rows.
func ListAdminTimetableRows(w http.ResponseWriter, r *http.Request) {
	categoryID, academicYear, term, err := resolveTimetableScope(
		r.URL.Query().Get("category_slug"),
		r.URL.Query().Get("academic_year"),
		r.URL.Query().Get("term"),
	)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := buildTimetableRowsResponse(categoryID, academicYear, term)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch timetable rows")
		return
	}
	successResponse(w, resp)
}

// SaveAdminTimetableRows - PUT /api/v1/admin/timetable-rows
// Replaces every offering/meeting in the given scope with the admin's edited
// rows (full replace, same semantics as CSV import — see
// OfferingRepository.ReplaceForScope).
func SaveAdminTimetableRows(w http.ResponseWriter, r *http.Request) {
	var req dto.SaveTimetableRowsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	categoryID, academicYear, term, err := resolveTimetableScope(
		req.CategorySlug, strconv.Itoa(int(req.AcademicYear)), req.Term,
	)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	rows := make([]csvtimetable.ParsedRow, len(req.Rows))
	for i, in := range req.Rows {
		rows[i] = csvtimetable.ParsedRow{
			Day:        in.Day,
			Period:     in.Period,
			CourseCode: strings.TrimSpace(in.CourseCode),
			CourseName: strings.TrimSpace(in.CourseName),
			Instructor: strings.TrimSpace(in.Instructor),
			Campus:     strings.TrimSpace(in.Campus),
			Classroom:  strings.TrimSpace(in.Classroom),
			Note:       strings.TrimSpace(in.Note),
		}
	}

	offRepo := &repository.OfferingRepository{}
	if _, err := offRepo.ReplaceForScope(categoryID, academicYear, term, rows); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to save timetable rows: "+err.Error())
		return
	}

	resp, err := buildTimetableRowsResponse(categoryID, academicYear, term)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to reload timetable rows")
		return
	}
	successResponse(w, resp)
}

const maxTimetableRowsCSVBytes = 5 << 20 // 5MB

// currentTimetableParsedRows reads the current live offerings+meetings for a
// scope and flattens them into csvtimetable.ParsedRow, the same shape a CSV
// parses into. Used as the "main rows" base when an admin uploads only a
// 集中講義 CSV for a scope that already has data — without this, adding
// intensive courses later would require re-uploading the whole main CSV
// every time, since ReplaceForScope always replaces the full scope.
func currentTimetableParsedRows(categoryID int64, academicYear int16, term string) ([]csvtimetable.ParsedRow, error) {
	offRepo := &repository.OfferingRepository{}
	offerings, err := offRepo.GetOfferingsByCategory(categoryID, academicYear, term)
	if err != nil {
		return nil, err
	}

	offeringIDs := make([]int64, len(offerings))
	for i, off := range offerings {
		offeringIDs[i] = off.OfferingID
	}
	meetRepo := &repository.MeetingRepository{}
	meetingsByOffering, err := meetRepo.GetMeetingsByOfferingIDs(offeringIDs)
	if err != nil {
		return nil, err
	}

	var rows []csvtimetable.ParsedRow
	for _, off := range offerings {
		instructor := ""
		if len(off.InstructorNames) > 0 {
			instructor = off.InstructorNames[0]
		}

		meetings := meetingsByOffering[off.OfferingID]
		if len(meetings) == 0 {
			rows = append(rows, csvtimetable.ParsedRow{
				CourseCode: off.CourseCode,
				CourseName: off.Subject.Title,
				Instructor: instructor,
				Note:       off.Note,
			})
			continue
		}
		for _, m := range meetings {
			rows = append(rows, csvtimetable.ParsedRow{
				Day:        m.Day,
				Period:     m.Period,
				CourseCode: off.CourseCode,
				CourseName: off.Subject.Title,
				Instructor: instructor,
				Classroom:  m.Classroom,
				Note:       off.Note,
			})
		}
	}
	return rows, nil
}

// ImportAdminTimetableRowsCSV - POST /api/v1/admin/timetable-rows/import
// multipart form: academic_year, term, category_slug, csv (file, optional),
// intensive_csv (file, optional) — at least one of csv/intensive_csv is
// required. Parses the CSV(s) and immediately replaces the scope's live
// data — there is no draft/staging step.
//
// csv given, no intensive_csv: replace the scope with just the main CSV.
// csv + intensive_csv: replace the scope with the merged result (existing
// behavior — matching course codes in intensive_csv win).
// intensive_csv only, no csv: merge intensive_csv into the scope's CURRENT
// live data instead of a freshly parsed main CSV, so an admin can add
// intensive courses after the fact without re-uploading the whole timetable.
func ImportAdminTimetableRowsCSV(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxTimetableRowsCSVBytes+(1<<20))
	if err := r.ParseMultipartForm(maxTimetableRowsCSVBytes); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid multipart form")
		return
	}

	categoryID, academicYear, term, err := resolveTimetableScope(
		r.FormValue("category_slug"), r.FormValue("academic_year"), r.FormValue("term"),
	)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	var parsedRows []csvtimetable.ParsedRow
	haveMain := false

	if file, _, ferr := r.FormFile("csv"); ferr == nil {
		defer file.Close()
		haveMain = true
		parsedRows, err = csvtimetable.Parse(file, term)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, "CSVの解析に失敗しました: "+err.Error())
			return
		}
		if len(parsedRows) == 0 {
			errorResponse(w, http.StatusBadRequest, "時間割データがCSVから見つかりませんでした")
			return
		}
	}

	if intensiveFile, _, ferr := r.FormFile("intensive_csv"); ferr == nil {
		defer intensiveFile.Close()
		intensiveRows, err := csvtimetable.Parse(intensiveFile, term)
		if err != nil {
			errorResponse(w, http.StatusBadRequest, "集中講義のCSVの解析に失敗しました: "+err.Error())
			return
		}

		if !haveMain {
			// No main CSV this time — add these intensive rows on top of
			// what's already saved for this scope instead of wiping it.
			parsedRows, err = currentTimetableParsedRows(categoryID, academicYear, term)
			if err != nil {
				errorResponse(w, http.StatusInternalServerError, "既存データの取得に失敗しました")
				return
			}
		}
		parsedRows = csvtimetable.MergeIntensiveRows(parsedRows, intensiveRows)
	} else if !haveMain {
		errorResponse(w, http.StatusBadRequest, "csv または intensive_csv のいずれかが必要です")
		return
	}

	offRepo := &repository.OfferingRepository{}
	if _, err := offRepo.ReplaceForScope(categoryID, academicYear, term, parsedRows); err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to import timetable rows: "+err.Error())
		return
	}

	resp, err := buildTimetableRowsResponse(categoryID, academicYear, term)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to reload timetable rows")
		return
	}
	successResponse(w, resp)
}
