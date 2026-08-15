package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// UserRepository handles user data access
type UserRepository struct{}

// GetUserByAuthUID returns a user by external Auth UID.
func (r *UserRepository) GetUserByAuthUID(authUID string) (*models.User, error) {
	var user models.User
	err := config.DB.Where("auth_uid = ?", authUID).First(&user).Error
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

// ListUsers returns users matching the optional role and query, ordered by user_id.
func (r *UserRepository) ListUsers(role string, query string) ([]models.User, error) {
	var users []models.User
	db := config.DB.Model(&models.User{})
	if role != "" {
		db = db.Where("role = ?", role)
	}
	if query != "" {
		pattern := "%" + query + "%"
		db = db.Where("display_name ILIKE ? OR email ILIKE ? OR CAST(user_id AS TEXT) ILIKE ?", pattern, pattern, pattern)
	}
	err := db.Order("user_id asc").Find(&users).Error
	return users, err
}

// CountUsersByRole returns role counts matching the optional search query.
func (r *UserRepository) CountUsersByRole(query string) (map[string]int64, error) {
	type row struct {
		Role  string
		Count int64
	}

	var rows []row
	db := config.DB.Model(&models.User{})
	if query != "" {
		pattern := "%" + query + "%"
		db = db.Where("display_name ILIKE ? OR email ILIKE ? OR CAST(user_id AS TEXT) ILIKE ?", pattern, pattern, pattern)
	}
	if err := db.Select("role, count(*) as count").Group("role").Scan(&rows).Error; err != nil {
		return nil, err
	}

	counts := map[string]int64{
		"admin":  0,
		"editor": 0,
		"user":   0,
	}
	for _, row := range rows {
		counts[row.Role] = row.Count
	}
	return counts, nil
}
