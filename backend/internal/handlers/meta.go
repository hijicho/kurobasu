package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/internal/repository"
)

// GetDefaultAcademicYear - GET /api/v1/meta/default-academic-year
func GetDefaultAcademicYear(w http.ResponseWriter, r *http.Request) {
	year := time.Now().Year()
	successResponse(w, map[string]interface{}{"academic_year": year})
}

// calendarDefaultTerm computes the term shown to users when no admin
// override is set: 4〜9月は前期(spring)、10〜3月は後期(fall)。
func calendarDefaultTerm(now time.Time) string {
	month := int(now.Month())
	if month >= 4 && month <= 9 {
		return "spring"
	}
	return "fall"
}

// GetDefaultTerm - GET /api/v1/meta/default-term
// 管理画面で上書きされていればその値を、なければカレンダー基準の値を返す
func GetDefaultTerm(w http.ResponseWriter, r *http.Request) {
	settingRepo := &repository.SettingRepository{}
	override, err := settingRepo.GetDefaultTermOverride()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "デフォルト学期の取得に失敗しました")
		return
	}

	if override != nil && *override != "" {
		successResponse(w, map[string]interface{}{"term": *override, "is_override": true})
		return
	}

	successResponse(w, map[string]interface{}{"term": calendarDefaultTerm(time.Now()), "is_override": false})
}

// UpdateAdminDefaultTerm - PUT /api/v1/admin/settings/default-term
// admin/editor ロールのみ。term に "spring"/"fall" を指定して固定表示に切り替え、
// "auto"（または空文字）を指定するとカレンダー基準の自動判定に戻す。
func UpdateAdminDefaultTerm(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Term string `json:"term"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		errorResponse(w, http.StatusBadRequest, "リクエストの形式が不正です")
		return
	}

	term := strings.ToLower(strings.TrimSpace(body.Term))
	settingRepo := &repository.SettingRepository{}

	var override *string
	switch term {
	case "spring", "fall":
		override = &term
	case "", "auto":
		override = nil
	default:
		errorResponse(w, http.StatusBadRequest, "term は spring, fall, auto のいずれかを指定してください")
		return
	}

	if err := settingRepo.SetDefaultTermOverride(override); err != nil {
		errorResponse(w, http.StatusInternalServerError, "デフォルト学期の更新に失敗しました")
		return
	}

	if override != nil {
		successResponse(w, map[string]interface{}{"term": *override, "is_override": true})
		return
	}
	successResponse(w, map[string]interface{}{"term": calendarDefaultTerm(time.Now()), "is_override": false})
}
