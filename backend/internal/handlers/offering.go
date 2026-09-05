package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/middleware"
	"github.com/hageruto/kurobasu/internal/repository"
	"github.com/hageruto/kurobasu/models"
)

func toOfferingResponse(off models.Offering, meetings []models.Meeting, rating repository.OfferingRatingSummary, reviews repository.ReviewSummary) dto.OfferingResponse {
	meetingDTOs := make([]dto.MeetingResponse, len(meetings))
	for j, m := range meetings {
		meetingDTOs[j] = dto.MeetingResponse{
			Day:       m.Day,
			Period:    m.Period,
			Classroom: m.Classroom,
		}
	}

	var ratingAverage *float64
	if rating.SampleCount > 0 {
		value := rating.AverageScore
		ratingAverage = &value
	}
	var ratingRank *string
	if rating.SampleCount > 0 {
		rank := ratingRankForScore(rating.AverageScore)
		ratingRank = &rank
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
		RatingAverage:   ratingAverage,
		RatingCount:     rating.SampleCount,
		RatingRank:      ratingRank,
		ReviewCount:     reviews.Count,
		LatestReviewAt:  latestReviewAtPtr(reviews),
	}
}

func latestReviewAtPtr(reviews repository.ReviewSummary) *time.Time {
	if reviews.Count == 0 || reviews.LatestCreatedAt.IsZero() {
		return nil
	}
	t := reviews.LatestCreatedAt
	return &t
}

func ratingRankForScore(score float64) string {
	switch {
	case score >= 4.9:
		return "AA"
	case score >= 4.4:
		return "A"
	case score >= 3.0:
		return "B"
	default:
		return "C"
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

	offeringIDs := make([]int64, len(offerings))
	for i, off := range offerings {
		offeringIDs[i] = off.OfferingID
	}
	meetRepo := &repository.MeetingRepository{}
	meetingsByOffering, err := meetRepo.GetMeetingsByOfferingIDs(offeringIDs)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch meetings")
		return
	}

	ratingRepo := &repository.OfferingRatingRepository{}
	ratingsByOffering, err := ratingRepo.GetSummariesByOfferingIDs(offeringIDs)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch ratings")
		return
	}

	reviewRepo := &repository.ReviewRepository{}
	reviewSummariesByOffering, err := reviewRepo.GetApprovedSummariesByOfferingIDs(offeringIDs)
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch review counts")
		return
	}

	items := make([]dto.OfferingResponse, len(offerings))
	for i, off := range offerings {
		items[i] = toOfferingResponse(off, meetingsByOffering[off.OfferingID], ratingsByOffering[off.OfferingID], reviewSummariesByOffering[off.OfferingID])
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

	ratingRepo := &repository.OfferingRatingRepository{}
	ratingsByOffering, _ := ratingRepo.GetSummariesByOfferingIDs([]int64{offering.OfferingID})

	reviewRepo := &repository.ReviewRepository{}
	reviewSummariesByOffering, _ := reviewRepo.GetApprovedSummariesByOfferingIDs([]int64{offering.OfferingID})

	response := toOfferingResponse(*offering, meetings, ratingsByOffering[offering.OfferingID], reviewSummariesByOffering[offering.OfferingID])

	// 削除ボタンの表示可否をフロントで判断できるよう、このリクエストの投稿者
	// (ログインユーザー or 既存の匿名Cookie)自身の評価があれば含める。ここでは
	// 新規にCookieを発行しない(voterKeyIfPresent) — Cookieが無ければ「まだ何も
	// 投稿していない」で確定なので、その場合の問い合わせは省略する。
	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}
	voterKey := voterKeyIfPresent(r)
	if userID != nil || voterKey != "" {
		if score, err := ratingRepo.GetMyRating(offering.OfferingID, userID, voterKey); err == nil {
			response.YourRating = &score
		}
	}

	successResponse(w, response)
}

// CreateOfferingRating - POST /api/v1/offerings/{id}/ratings
func CreateOfferingRating(w http.ResponseWriter, r *http.Request) {
	offeringID := extractID(r, "id")

	var req dto.CreateOfferingRatingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		errorResponse(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Score < 1 || req.Score > 5 {
		errorResponse(w, http.StatusBadRequest, "score must be between 1 and 5")
		return
	}

	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}

	var voterKey string
	if userID == nil {
		if !allowRatingSubmission(clientIP(r)) {
			errorResponse(w, http.StatusTooManyRequests, "評価の投稿が多すぎます。しばらくしてから再度お試しください。")
			return
		}
		voterKey = voterKeyFromRequest(w, r)
	}

	ratingRepo := &repository.OfferingRatingRepository{}
	summary, err := ratingRepo.SaveRating(offeringID, userID, voterKey, req.Score)
	if err != nil {
		if errors.Is(err, repository.ErrOfferingNotFound) {
			errorResponse(w, http.StatusNotFound, "Offering not found")
			return
		}
		errorResponse(w, http.StatusInternalServerError, "Failed to save rating")
		return
	}

	response := ratingResponseFromSummary(offeringID, summary)
	response.YourRating = &req.Score
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": response})
}

// DeleteOfferingRating - DELETE /api/v1/offerings/{id}/ratings
// 呼び出し元自身(ログインユーザー or 匿名Cookie)の評価だけを削除する。
func DeleteOfferingRating(w http.ResponseWriter, r *http.Request) {
	offeringID := extractID(r, "id")

	var userID *int64
	if user, ok := middleware.CurrentUser(r); ok {
		userID = &user.UserID
	}
	// 削除時は新規にCookieを発行しない: 発行したばかりのCookieに評価がある
	// はずがないので、無ければ「削除対象なし」で即座に確定できる。
	voterKey := voterKeyIfPresent(r)

	ratingRepo := &repository.OfferingRatingRepository{}
	summary, err := ratingRepo.DeleteRating(offeringID, userID, voterKey)
	if err != nil {
		if errors.Is(err, repository.ErrRatingNotFound) {
			errorResponse(w, http.StatusNotFound, "削除対象の評価が見つかりません")
			return
		}
		errorResponse(w, http.StatusInternalServerError, "Failed to delete rating")
		return
	}

	successResponse(w, ratingResponseFromSummary(offeringID, summary))
}

// ratingResponseFromSummary builds the rating portion of a response from an
// aggregate summary, omitting average/rank when there are no ratings left
// (SampleCount == 0) rather than reporting a misleading zero.
func ratingResponseFromSummary(offeringID int64, summary repository.OfferingRatingSummary) dto.OfferingRatingResponse {
	response := dto.OfferingRatingResponse{
		OfferingID:  offeringID,
		RatingCount: summary.SampleCount,
	}
	if summary.SampleCount > 0 {
		average := summary.AverageScore
		rank := ratingRankForScore(summary.AverageScore)
		response.RatingAverage = &average
		response.RatingRank = &rank
	}
	return response
}
