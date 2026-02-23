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
	OfferingID      int64                `json:"offering_id"`
	Subject         SubjectResponse      `json:"subject"`
	AcademicYear    int16                `json:"academic_year"`
	Term            string               `json:"term"` // spring, fall, intensive, year
	Modality        string               `json:"modality"`   // onsite, online, hybrid, unknown
	InstructorNames []string             `json:"instructor_names"`
	Meetings        []MeetingResponse    `json:"meetings"` // この開講の授業時間割
}
	Modality        string               `json:"modality"`
	InstructorNames []string             `json:"instructor_names"`
	Meetings        []MeetingResponse    `json:"meetings"`
	Rate            *string              `json:"rate,omitempty"`
}

// Review Response
type ReviewResponse struct {
	ReviewID  int64              `json:"review_id"`
	MdURL     string             `json:"md_url"`
	Status    string             `json:"status"`
	Author    UserResponse       `json:"author"`
	CreatedAt time.Time          `json:"created_at"`
}

// User Response
type UserResponse struct {
	UserID      int64     `json:"user_id"`
	DisplayName string    `json:"display_name"`
	CreatedAt   time.Time `json:"created_at"`
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
type CreateReviewRequest struct {
	OfferingID int64  `json:"offering_id"`
	MdURL      string `json:"md_url"`
	Status     string `json:"status"`
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
