package dto

import "time"

// =====================
// API レスポンス用 DTO（データ転送オブジェクト）
// =====================
// 役割: API がクライアントに返す JSON データの構造を定義
// json タグで JSON キー名を指定
// 利点:
//   1. DB スキーマと API レスポンス形式を独立させられる
//   2. 必要なフィールドだけをクライアントに返せる
//   3. 構造変更時の影響を限定できる

// =====================
// CategoryResponse: カテゴリー情報のレスポーンス
// =====================
type CategoryResponse struct {
	CategoryID int64  `json:"category_id"`
	Slug       string `json:"slug"`
	Name       string `json:"name"`
	SortOrder  int    `json:"sort_order"`
}

// =====================
// SubjectResponse: 科目情報のレスポーンス
// =====================
type SubjectResponse struct {
	SubjectID int64  `json:"subject_id"`
	Title     string `json:"title"`
}

// =====================
// MeetingResponse: 授業時間割情報のレスポーンス
// =====================
type MeetingResponse struct {
	Day       *int16 `json:"day"`    // 曜日 (1=月, 2=火, ..., 7=日)。曜日・時限が定まらない集中講義/時間割外は null
	Period    *int16 `json:"period"` // 時限 (1-10)。day と同様 null になりうる
	Classroom string `json:"classroom,omitempty"`
}

// =====================
// OfferingResponse: 開講情報のレスポーンス
// =====================
type OfferingResponse struct {
	OfferingID   int64           `json:"offering_id"`
	Subject      SubjectResponse `json:"subject"`
	AcademicYear int16           `json:"academic_year"`
	Term         string          `json:"term"`     // spring, fall
	Modality     string          `json:"modality"` // onsite, online, hybrid, unknown
	// CourseCode: 時間割表の授業コード。クラス・学期ごとに異なるため Subject ではなく Offering に紐づく
	CourseCode      string            `json:"course_code,omitempty"`
	Note            string            `json:"note,omitempty"`
	InstructorNames []string          `json:"instructor_names"`
	Meetings        []MeetingResponse `json:"meetings"` // この開講の授業時間割
	RatingAverage   *float64          `json:"rating_average,omitempty"`
	RatingCount     int               `json:"rating_count"`
	RatingRank      *string           `json:"rating_rank,omitempty"`
	// ReviewCount: 承認済みの口コミ（良かった/悪かった/その他）の件数合計
	ReviewCount int `json:"review_count"`
	// LatestReviewAt: 最新の承認済み口コミの投稿日時（口コミ順ソート用、口コミが無ければnil）
	LatestReviewAt *time.Time `json:"latest_review_at,omitempty"`
}

// Review Response
// ReviewResponse removed: use aggregated list or inline responses instead

// ListReviewsResponse は開講に紐づく公開レビューを type 別に分けたレスポンス
type ListReviewsResponse struct {
	Pros   []string `json:"pros"`
	Cons   []string `json:"cons"`
	Others []string `json:"others"`
	Count  int      `json:"count"`
}

// UserReviewResponse はログインユーザーのレビュー1行分の情報を返します
// （1回の投稿は pros/cons/[others] の複数行になるため、1行 = 1エントリ）
type UserReviewResponse struct {
	ReviewID   int64     `json:"review_id"`
	OfferingID int64     `json:"offering_id"`
	Comment    string    `json:"comment"`
	Type       string    `json:"type"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ListUserReviewsResponse は自分のレビュー一覧レスポンスです
type ListUserReviewsResponse struct {
	Reviews []UserReviewResponse `json:"reviews"`
	Count   int                  `json:"count"`
}

// AdminReviewResponse は管理画面でレビューを確認するための情報です
type AdminReviewResponse struct {
	ReviewID        int64     `json:"review_id"`
	UserID          *int64    `json:"user_id,omitempty"`
	UserDisplayName string    `json:"user_display_name,omitempty"`
	OfferingID      int64     `json:"offering_id"`
	SubjectTitle    string    `json:"subject_title"`
	InstructorNames []string  `json:"instructor_names"`
	AcademicYear    int16     `json:"academic_year"`
	Term            string    `json:"term"`
	Comment         string    `json:"comment"`
	Type            string    `json:"type"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// ListAdminReviewsResponse は管理画面のレビュー一覧レスポンスです
type ListAdminReviewsResponse struct {
	Items []AdminReviewResponse `json:"items"`
	Count int                   `json:"count"`
}

// UpdateReviewStatusRequest はレビューの承認・未確認戻しリクエストです
type UpdateReviewStatusRequest struct {
	Status string `json:"status"`
}

// AdImageResponse は広告画像の管理・公開レスポンスです
type AdImageResponse struct {
	AdID             int64     `json:"ad_id"`
	AcademicYear     int16     `json:"academic_year"`
	Term             string    `json:"term"`
	ImageURL         string    `json:"image_url"`
	OriginalFilename string    `json:"original_filename"`
	ContentType      string    `json:"content_type"`
	FileSize         int64     `json:"file_size"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type ListAdImagesResponse struct {
	Items []AdImageResponse `json:"items"`
	Count int               `json:"count"`
}

// User Response
type UserResponse struct {
	UserID      int64     `json:"user_id"`
	AuthUID     string    `json:"auth_uid"`
	DisplayName string    `json:"display_name"`
	Email       *string   `json:"email,omitempty"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"created_at"`
}

// ListUsersResponse は管理者向けの全ユーザー一覧レスポンス
type ListUsersResponse struct {
	Items      []UserResponse `json:"items"`
	Count      int            `json:"count"`
	RoleCounts map[string]int `json:"role_counts"`
}

type SiteSettingsResponse struct {
	DefaultAcademicYear int16     `json:"default_academic_year"`
	DefaultTerm         string    `json:"default_term"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// UpdateUserRoleRequest はユーザーのロール変更リクエスト
type UpdateUserRoleRequest struct {
	Role string `json:"role"`
}

// Timetable Response
type TimetableResponse struct {
	TimetableID int64                   `json:"timetable_id"`
	UserID      int64                   `json:"user_id"`
	Title       string                  `json:"title"`
	Year        int16                   `json:"year"`
	Term        string                  `json:"term"`
	IsPublic    bool                    `json:"is_public"`
	CreatedAt   time.Time               `json:"created_at"`
	Items       []TimetableItemResponse `json:"items,omitempty"`
}

// TimetableItem Response
type TimetableItemResponse struct {
	OfferingID int64  `json:"offering_id"`
	DayOfWeek  *int16 `json:"day_of_week"`
	Period     *int16 `json:"period"`
	IsSelected bool   `json:"is_selected"`
}

// Request DTOs ================================

// CreateReviewRequest は口コミ1件分の投稿リクエストです。
type CreateReviewRequest struct {
	OfferingID int64  `json:"offering_id"`
	Type       string `json:"type"`
	Comment    string `json:"comment"`
}

type CreateOfferingRatingRequest struct {
	Score int16 `json:"score"`
}

type OfferingRatingResponse struct {
	OfferingID    int64    `json:"offering_id"`
	RatingAverage *float64 `json:"rating_average,omitempty"`
	RatingCount   int      `json:"rating_count"`
	RatingRank    *string  `json:"rating_rank,omitempty"`
}

// BootstrapUserRequest
type BootstrapUserRequest struct {
	DisplayName string `json:"display_name"`
}

// UpdateUserRequest
type UpdateUserRequest struct {
	DisplayName string `json:"display_name"`
}

type UpdateSiteSettingsRequest struct {
	DefaultAcademicYear int16  `json:"default_academic_year"`
	DefaultTerm         string `json:"default_term"`
}

// CreateTimetableRequest
type CreateTimetableRequest struct {
	Title string `json:"title"`
	Year  int16  `json:"year"`
	Term  string `json:"term"`
}

// UpdateTimetableRequest
type UpdateTimetableRequest struct {
	Title    *string `json:"title"`
	IsPublic *bool   `json:"is_public"`
	Items    []struct {
		OfferingID int64  `json:"offering_id"`
		DayOfWeek  *int16 `json:"day_of_week"`
		Period     *int16 `json:"period"`
		IsSelected bool   `json:"is_selected"`
	} `json:"items"`
}

// Common Response Wrapper
type ListResponse struct {
	Items interface{} `json:"items"`
}

// =====================
// TimetableRows (管理画面: 時間割の直接編集・CSVインポート) Response/Request DTOs
// =====================
// 下書き/公開の2段階は廃止。CSVインポートも手動編集の保存も、対象の
// (category, academic_year, term) の授業データを丸ごと入れ替える1本の
// 経路（OfferingRepository.ReplaceForScope）を通る。

type TimetableRowResponse struct {
	OfferingID int64  `json:"offering_id,omitempty"`
	Day        *int16 `json:"day"`
	Period     *int16 `json:"period"`
	CourseCode string `json:"course_code"`
	CourseName string `json:"course_name"`
	Instructor string `json:"instructor"`
	Campus     string `json:"campus"`
	Classroom  string `json:"classroom"`
	Note       string `json:"note"`
}

type ListTimetableRowsResponse struct {
	Items []TimetableRowResponse `json:"items"`
}

// SaveTimetableRowsRequest replaces every row of a (category, academic_year,
// term) scope with the admin's edited rows.
type SaveTimetableRowsRequest struct {
	CategorySlug string              `json:"category_slug"`
	AcademicYear int16               `json:"academic_year"`
	Term         string              `json:"term"`
	Rows         []TimetableRowInput `json:"rows"`
}

type TimetableRowInput struct {
	Day        *int16 `json:"day"`
	Period     *int16 `json:"period"`
	CourseCode string `json:"course_code"`
	CourseName string `json:"course_name"`
	Instructor string `json:"instructor"`
	Campus     string `json:"campus"`
	Classroom  string `json:"classroom"`
	Note       string `json:"note"`
}

// Error Response
type ErrorResponse struct {
	Error string `json:"error"`
}
