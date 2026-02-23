package repository

import (
	"github.com/hageruto/kurobasu/config" // GORM DB インスタンス
	"github.com/hageruto/kurobasu/models"  // GORM モデル定義
)

// =====================
// CategoryRepository: カテゴリー操作用
// =====================
// 役割：カテゴリー関連のデータベース操作を担当
// GORM (Go Object-Relational Mapping) を使用してデータベース操作をシンプル化
type CategoryRepository struct{}

// GetAllCategories: すべてのカテゴリーを sort_order の昇順で返す
// 入力：なし
// 出力：models.Category の配列、またはエラー
// DB操作：SELECT * FROM categories ORDER BY sort_order ASC
func (r *CategoryRepository) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	// GORM の Find() メソッドで複数行を取得
	if err := config.DB.Order("sort_order ASC").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// GetCategoryBySlug returns a category by slug
func (r *CategoryRepository) GetCategoryBySlug(slug string) (*models.Category, error) {
	var category models.Category
	if err := config.DB.Where("slug = ?", slug).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

// OfferingRepository handles offering data access
type OfferingRepository struct{}

// GetOfferingsByCategory returns offerings filtered by category slug, academic year, and term
func (r *OfferingRepository) GetOfferingsByCategory(categoryID int64, academicYear int16, term string) ([]models.Offering, error) {
	var offerings []models.Offering
	err := config.DB.
		Preload("Subject").
		Joins("JOIN subjects ON offerings.subject_id = subjects.subject_id").
		Where("subjects.category_id = ? AND offerings.academic_year = ? AND offerings.term = ?",
			categoryID, academicYear, term).
		Order("offerings.created_at ASC").
		Find(&offerings).Error
	return offerings, err
}

// GetOfferingByID returns a single offering with subject info
func (r *OfferingRepository) GetOfferingByID(offeringID int64) (*models.Offering, error) {
	var offering models.Offering
	err := config.DB.Preload("Subject").First(&offering, offeringID).Error
	return &offering, err
}

// MeetingRepository handles meeting data access
type MeetingRepository struct{}

// GetMeetingsByOffering returns all meetings for an offering
func (r *MeetingRepository) GetMeetingsByOffering(offeringID int64) ([]models.Meeting, error) {
	var meetings []models.Meeting
	err := config.DB.
		Where("offering_id = ?", offeringID).
		Order("day ASC, period ASC").
		Find(&meetings).Error
	return meetings, err
}

// ReviewRepository handles review data access
type ReviewRepository struct{}

// GetReviewsByOffering returns all public reviews for an offering
func (r *ReviewRepository) GetReviewsByOffering(offeringID int64) ([]models.Review, error) {
	var reviews []models.Review
	err := config.DB.
		Preload("Offering").
		Where("offering_id = ? AND status = ?", offeringID, "public").
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

// GetReviewByID returns a single review by ID
func (r *ReviewRepository) GetReviewByID(reviewID int64) (*models.Review, error) {
	var review models.Review
	err := config.DB.Preload("Offering").First(&review, reviewID).Error
	return &review, err
}

// CreateReview creates a new review
func (r *ReviewRepository) CreateReview(review *models.Review) error {
	return config.DB.Create(review).Error
}

// UserRepository handles user data access
type UserRepository struct{}

// GetUserByFirebaseUID returns a user by Firebase UID
func (r *UserRepository) GetUserByFirebaseUID(firebaseUID string) (*models.User, error) {
	var user models.User
	err := config.DB.Where("firebase_uid = ?", firebaseUID).First(&user).Error
	return &user, err
}

// GetUserByID returns a user by ID
func (r *UserRepository) GetUserByID(userID int64) (*models.User, error) {
	var user models.User
	err := config.DB.First(&user, userID).Error
	return &user, err
}

// CreateUser creates a new user
func (r *UserRepository) CreateUser(user *models.User) error {
	return config.DB.Create(user).Error
}

// UpdateUser updates user information
func (r *UserRepository) UpdateUser(user *models.User) error {
	return config.DB.Save(user).Error
}

// TimetableRepository handles timetable data access
type TimetableRepository struct{}

// GetTimetableByID returns a timetable with its items
func (r *TimetableRepository) GetTimetableByID(timetableID int64) (*models.Timetable, error) {
	var timetable models.Timetable
	err := config.DB.Preload("Items").First(&timetable, timetableID).Error
	return &timetable, err
}

// GetTimetableByUserID returns the timetable for a user (assuming 1 per user)
func (r *TimetableRepository) GetTimetableByUserID(userID int64) (*models.Timetable, error) {
	var timetable models.Timetable
	err := config.DB.Preload("Items").Where("user_id = ?", userID).First(&timetable).Error
	return &timetable, err
}

// CreateTimetable creates a new timetable
func (r *TimetableRepository) CreateTimetable(timetable *models.Timetable) error {
	return config.DB.Create(timetable).Error
}

// UpdateTimetable updates timetable information
func (r *TimetableRepository) UpdateTimetable(timetable *models.Timetable) error {
	return config.DB.Save(timetable).Error
}

// TimetableItemRepository handles timetable item data access
type TimetableItemRepository struct{}

// CreateTimetableItem adds an offering to a timetable
func (r *TimetableItemRepository) CreateTimetableItem(item *models.TimetableItem) error {
	return config.DB.Create(item).Error
}

// DeleteTimetableItem removes an offering from a timetable
func (r *TimetableItemRepository) DeleteTimetableItem(timetableID, offeringID int64) error {
	return config.DB.Where("timetable_id = ? AND offering_id = ?", timetableID, offeringID).Delete(&models.TimetableItem{}).Error
}
