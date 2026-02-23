package config

import (
	"log"

	"gorm.io/driver/postgres" // PostgreSQL ドライバー
	"gorm.io/gorm"             // GORM ORM ライブラリ
)

// =====================
// グローバル変数 DB
// =====================
// 役割: アプリケーション全体で使用するデータベース接続インスタンスを保持
// *gorm.DB: GORM のデータベース接続ハンドル
var DB *gorm.DB

// =====================
// InitDB: PostgreSQL データベースに接続
// =====================
// 入力: dsn (Data Source Name)
//   例: "host=localhost port=5432 user=postgres password=postgres dbname=kurobasu sslmode=disable"
// 出力: エラー (接続失敗時)
// 役割:
//   1. PostgreSQL ドライバーを使用して接続を確立
//   2. グローバル変数 DB に接続インスタンスを設定
//   3. 以降すべてのハンドラーやリポジトリで config.DB を使用してデータベース操作が可能に
func InitDB(dsn string) error {
	var err error
	// gorm.Open: GORM を使用してデータベースに接続
	// postgres.Open(dsn): DSN 文字列を指定して PostgreSQL ドライバーを初期化
	// &gorm.Config{}: GORM の設定オプション（ここではデフォルト）
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

