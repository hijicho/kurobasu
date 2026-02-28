package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

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
