package config

import (
	"fmt"
	"kurobasu/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(dsn string) error {
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

func AutoMigrate() error {
	return DB.AutoMigrate(
		&models.Category{},
		&models.Subject{},
		&models.Offering{},
		&models.Meeting{},
		&models.Review{},
		&models.User{},
		&models.Timetable{},
		&models.TimetableItem{},
	)
}
