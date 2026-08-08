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
	Day    int16 `json:"day"`      // 曜日 (1=月, 2=火, ..., 7=日)
	Period int16 `json:"period"`   // 時限 (1-10)
}

// =====================
// OfferingResponse: 開講情報のレスポーンス
// =====================
type OfferingResponse struct {
	OfferingID      int64             `json:"offering_id"`
	Subject         SubjectResponse   `json:"subject"`
	AcademicYear    int16             `json:"academic_year"`
	Term            string            `json:"term"` // spring, fall, intensive, year
	Modality        string            `json:"modality"` // onsite, online, hybrid, unknown
	InstructorNames []string          `json:"instructor_names"`
	Meetings        []MeetingResponse `json:"meetings"` // この開講の授業時間割
	Rate            *string           `json:"rate,omitempty"`
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

// User Response
type UserResponse struct {
	UserID      int64     `json:"user_id"`
	FirebaseUID string    `json:"firebase_uid"`
	DisplayName string    `json:"display_name"`
	Role        string    `json:"role"`
	CreatedAt   time.Time `json:"created_at"`
}

// ListUsersResponse は管理者向けの全ユーザー一覧レスポンス
type ListUsersResponse struct {
	Items []UserResponse `json:"items"`
}

// UpdateUserRoleRequest はユーザーのロール変更リクエスト
type UpdateUserRoleRequest struct {
	Role string `json:"role"`
}

// Timetable Response
type TimetableResponse struct {
	TimetableID int64                    `json:"timetable_id"`
	UserID      int64                    `json:"user_id"`
	Title       string                   `json:"title"`
	Year        int16                    `json:"year"`
	Term        string                   `json:"term"`
	IsPublic    bool                     `json:"is_public"`
	CreatedAt   time.Time                `json:"created_at"`
	Items       []TimetableItemResponse  `json:"items,omitempty"`
}

// TimetableItem Response
type TimetableItemResponse struct {
	OfferingID int64  `json:"offering_id"`
	DayOfWeek  *int16 `json:"day_of_week"`
	Period     *int16 `json:"period"`
	IsSelected bool   `json:"is_selected"`
}

// Request DTOs ================================

// CreateReviewRequest
// pros/cons は必須。others は任意の自由コメント
type CreateReviewRequest struct {
	OfferingID int64  `json:"offering_id"`
	Pros       string `json:"pros"`
	Cons       string `json:"cons"`
	Others     string `json:"others,omitempty"`
}

// BootstrapUserRequest
type BootstrapUserRequest struct {
	DisplayName string `json:"display_name"`
}

// UpdateUserRequest
type UpdateUserRequest struct {
	DisplayName string `json:"display_name"`
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
		OfferingID int64 `json:"offering_id"`
		DayOfWeek  *int16 `json:"day_of_week"`
		Period     *int16 `json:"period"`
		IsSelected bool  `json:"is_selected"`
	} `json:"items"`
}

// Common Response Wrapper
type ListResponse struct {
	Items interface{} `json:"items"`
}

// Error Response
type ErrorResponse struct {
	Error string `json:"error"`
}
