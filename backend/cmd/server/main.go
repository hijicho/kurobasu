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

	"github.com/joho/godotenv"           // .envファイルの読み込み
	"github.com/hageruto/kurobasu/config" // DB初期化
	"github.com/hageruto/kurobasu/internal/router" // ルーティング設定
)

func main() {
	// .envファイルを読み込む（存在しない場合は環境変数から取得する）
	// .envは本番環境では不要
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// =====================
	// データベース接続情報の読み込み
	// =====================
	// 環境変数から取得、なければデフォルト値を使用
	
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost" // デフォルト: ローカルマシン
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432" // デフォルト: PostgreSQLのデフォルトポート
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres" // デフォルト: PostgreSQLのデフォルトユーザー
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres" // デフォルト: 開発環境用パスワード
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "kurobasu" // デフォルト: kurobasu用のDB名
	}

	// PostgreSQL接続文字列を構築
	// DSN = Data Source Name: DBに接続するための文字列
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	
	// config.InitDB()がconfig/database.goで定義されている
	// グローバル変数 config.DB に GORM DB インスタンスを設定
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// =====================
	// Firebase Admin SDK の初期化
	// =====================
	// FIREBASE_SERVICE_ACCOUNT_KEY_PATH で指定したサービスアカウントJSONを読み込み、
	// 以降のリクエストで Firebase ID トークンを検証できるようにする
	if err := config.InitFirebase(); err != nil {
		log.Fatalf("Failed to initialize Firebase: %v", err)
	}

	// =====================
	// サーバーポートの設定
	// =====================
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000" // デフォルト: ポート8000
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

