package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"kurobasu/internal/router"
)

func main() {
	// .env ファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// サーバーの初期化
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	// ルーティング設定
	mux := router.SetupRoutes()

	// サーバー起動
	log.Println("Server starting on port " + port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
