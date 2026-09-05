package handlers

import (
	"net/http"
	"strings"
	"unicode"

	"github.com/hageruto/kurobasu/internal/csvreviews"
	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

const maxReviewsCSVBytes = 5 << 20 // 5MB

// reviewOfferingCandidate is one offering already on file for the chosen
// (category, academic_year, term) scope, projected down to the fields a CSV
// row can match on.
type reviewOfferingCandidate struct {
	OfferingID     int64
	NormInstructor string
	Day            *int16
	Period         *int16
}

// reviewDraft is one review row a matched CSV row should produce.
type reviewDraft struct {
	reviewType models.UserReviewType
	comment    string
}

// ImportAdminReviewsCSV - POST /api/v1/admin/reviews/import
// multipart form: category_slug, academic_year, term, csv (file).
//
// Each CSV row is matched against an offering already on file for that scope
// (imported earlier via the admin timetable CSV importer) by 講義名, then
// disambiguated by 担当教員名 and finally 曜日/時限 if several offerings
// share the same title. Rows that can't be matched confidently are skipped
// and reported back in the response instead of guessed, so the admin can fix
// the CSV or the timetable data and re-import.
//
// Matched rows insert one pending user_reviews row per non-empty answer
// column (same moderation queue as a normal user submission — this endpoint
// only adds them, it doesn't auto-approve) and, when 授業のおすすめ度 parses
// to 1-5, an anonymous offering_ratings row (unmoderated, like a normal
// visitor's rating submission).
func ImportAdminReviewsCSV(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxReviewsCSVBytes+(1<<20))
	if err := r.ParseMultipartForm(maxReviewsCSVBytes); err != nil {
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

	file, _, ferr := r.FormFile("csv")
	if ferr != nil {
		errorResponse(w, http.StatusBadRequest, "csv is required")
		return
	}
	defer file.Close()

	parsedRows, err := csvreviews.Parse(file)
	if err != nil {
		errorResponse(w, http.StatusBadRequest, "CSVの解析に失敗しました: "+err.Error())
		return
	}

	byTitle, err := loadReviewOfferingCandidates(categoryID, academicYear, term)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "授業データの取得に失敗しました")
		return
	}

	var reviewsToInsert []*models.UserReview
	var unmatched []string
	seenUnmatched := map[string]bool{}
	matchedRows := 0
	ratingsInserted := 0
	ratingRepo := &repository.OfferingRatingRepository{}

	for _, row := range parsedRows {
		cand := matchReviewOffering(row, byTitle)
		if cand == nil {
			key := strings.TrimSpace(row.CourseName) + " / " + strings.TrimSpace(row.Instructor)
			if !seenUnmatched[key] {
				seenUnmatched[key] = true
				unmatched = append(unmatched, key)
			}
			continue
		}
		matchedRows++

		for _, d := range buildReviewDrafts(row) {
			reviewsToInsert = append(reviewsToInsert, &models.UserReview{
				OfferingID: cand.OfferingID,
				Comment:    d.comment,
				Type:       d.reviewType,
				Status:     models.UserReviewStatusPending,
			})
		}

		if row.Score != nil {
			if _, err := ratingRepo.SaveRating(cand.OfferingID, nil, "", *row.Score); err == nil {
				ratingsInserted++
			}
		}
	}

	revRepo := &repository.ReviewRepository{}
	if err := revRepo.BulkInsertReviews(reviewsToInsert); err != nil {
		errorResponse(w, http.StatusInternalServerError, "口コミの登録に失敗しました: "+err.Error())
		return
	}

	successResponse(w, dto.ImportAdminReviewsResponse{
		TotalRows:          len(parsedRows),
		MatchedRows:        matchedRows,
		ReviewRowsInserted: len(reviewsToInsert),
		RatingsInserted:    ratingsInserted,
		Unmatched:          unmatched,
	})
}

// loadReviewOfferingCandidates loads every offering on file for a scope,
// keyed by whitespace-normalized subject title, so multiple CSV rows for the
// same course only pay for one query each (not one per row).
func loadReviewOfferingCandidates(categoryID int64, academicYear int16, term string) (map[string][]reviewOfferingCandidate, error) {
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

	byTitle := map[string][]reviewOfferingCandidate{}
	for _, off := range offerings {
		title := ""
		if off.Subject != nil {
			title = off.Subject.Title
		}
		instructor := ""
		if len(off.InstructorNames) > 0 {
			instructor = off.InstructorNames[0]
		}
		var day, period *int16
		if meetings := meetingsByOffering[off.OfferingID]; len(meetings) > 0 {
			day, period = meetings[0].Day, meetings[0].Period
		}

		key := normalizeReviewText(title)
		byTitle[key] = append(byTitle[key], reviewOfferingCandidate{
			OfferingID:     off.OfferingID,
			NormInstructor: normalizeReviewText(instructor),
			Day:            day,
			Period:         period,
		})
	}
	return byTitle, nil
}

// matchReviewOffering finds the offering a CSV row refers to: an exact
// (whitespace-normalized) title match, narrowed by instructor and then by
// 曜日/時限 only when several offerings share that title. Returns nil when
// the title isn't found, or when it's still ambiguous after narrowing.
func matchReviewOffering(row csvreviews.ParsedRow, byTitle map[string][]reviewOfferingCandidate) *reviewOfferingCandidate {
	cands := byTitle[normalizeReviewText(row.CourseName)]
	if len(cands) == 0 {
		return nil
	}
	if len(cands) == 1 {
		return &cands[0]
	}

	if normInstr := normalizeReviewText(row.Instructor); normInstr != "" {
		var byInstr []reviewOfferingCandidate
		for _, c := range cands {
			if c.NormInstructor == normInstr {
				byInstr = append(byInstr, c)
			}
		}
		if len(byInstr) == 1 {
			return &byInstr[0]
		}
		if len(byInstr) > 1 {
			cands = byInstr
		}
	}

	if row.Day != nil || row.Period != nil {
		var byDayPeriod []reviewOfferingCandidate
		for _, c := range cands {
			dayOK := row.Day == nil || (c.Day != nil && *c.Day == *row.Day)
			periodOK := row.Period == nil || (c.Period != nil && *c.Period == *row.Period)
			if dayOK && periodOK {
				byDayPeriod = append(byDayPeriod, c)
			}
		}
		if len(byDayPeriod) >= 1 {
			cands = byDayPeriod
		}
	}

	if len(cands) == 1 {
		return &cands[0]
	}
	return nil
}

// buildReviewDrafts turns one matched CSV row into the individual review
// rows it should produce. 講義・実習等の実施形態 has no dedicated column on
// Offering, so it's folded into a labeled "others" row instead of being
// dropped.
func buildReviewDrafts(row csvreviews.ParsedRow) []reviewDraft {
	var drafts []reviewDraft
	if v := strings.TrimSpace(row.Pros); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypePros, v})
	}
	if v := strings.TrimSpace(row.Cons); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeCons, v})
	}
	if v := strings.TrimSpace(row.Criteria); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeCriteria, v})
	}
	if v := strings.TrimSpace(row.TestBringIn); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeTestBringIn, v})
	}
	if v := strings.TrimSpace(row.AdviceForJuniors); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, v})
	}
	if v := strings.TrimSpace(row.OtherInfo); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, v})
	}
	if v := strings.TrimSpace(row.Format); v != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, "実施形態：" + v})
	}
	return drafts
}

func normalizeReviewText(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, s)
}
