package main

import (
	"fmt"
	"kurobasu/config"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// .env ファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// DB接続情報を構築
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	// データベースに接続
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 自動マイグレーション実行
	if err := config.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	log.Println("All migrations completed successfully!")
	log.Println("Backend is ready. API will be served on :" + os.Getenv("PORT"))
}
