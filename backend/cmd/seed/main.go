package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/migration"
	"github.com/hageruto/kurobasu/internal/seed"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// =====================
	// データベース接続情報の構築
	// =====================
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "kurobasu"
	}
	dbSSLMode := os.Getenv("DB_SSLMODE")
	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)

	// =====================
	// データベース接続
	// =====================
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// =====================
	// マイグレーション実行
	// =====================
	// テーブルが存在しない場合に作成する
	log.Println("Running migrations...")
	if err := migration.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// =====================
	// シードデータ挿入
	// =====================
	log.Println("Inserting seed data...")
	if err := seed.RunSeeds(); err != nil {
		log.Fatalf("Seeding failed: %v", err)
	}

	fmt.Println("All done! Seeding completed successfully")
}
