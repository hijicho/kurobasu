package main

// サーバーのエントリーポイントファイル
// 役割：
// 1. 環境変数の読み込み
// 2. データベース接続の初期化
// 3. HTTPサーバーの起動

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/hageruto/kurobasu/config"          // DB初期化
	"github.com/hageruto/kurobasu/internal/router" // ルーティング設定
	"github.com/joho/godotenv"                     // .envファイルの読み込み
)

func main() {
	// .envファイルを読み込む（存在しない場合は環境変数から取得する）
	// .envは本番環境では不要
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	dbHost := requiredEnv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := requiredEnv("DB_USER")
	dbPassword := requiredEnv("DB_PASSWORD")
	dbName := requiredEnv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")
	if dbSSLMode == "" {
		dbSSLMode = "require"
	}
	requiredEnv("SUPABASE_URL")
	requiredEnv("SUPABASE_ANON_KEY")
	requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
	requiredEnv("CORS_ALLOWED_ORIGINS")

	// PostgreSQL接続文字列を構築
	// DSN = Data Source Name: DBに接続するための文字列
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		dbHost, dbPort, dbUser, dbPassword, dbName, dbSSLMode)

	// config.InitDB()がconfig/database.goで定義されている
	// グローバル変数 config.DB に GORM DB インスタンスを設定
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// =====================
	// サーバーポートの設定
	// =====================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// =====================
	// ルーティング設定
	// =====================
	// router.SetupRoutes()が internal/router/router.go で定義されている
	// すべてのAPIエンドポイント(/api/v1/*)を登録する
	mux := router.SetupRoutes()

	// =====================
	// HTTPサーバー起動
	// =====================
	// net/http.ListenAndServeが HTTP サーバーをブロッキング起動
	// この行に達したら、ずっとサーバーは起動し続ける
	log.Println("Server starting on port " + port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

func requiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("%s is required", key)
	}
	return value
}
