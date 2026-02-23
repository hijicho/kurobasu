package main

import (
	"fmt"
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/migration"
	"log"
	"os"

	"github.com/joho/godotenv" // .env ファイルの読み込み
)

// =====================================================================
// cmd/migrate/main.go - DB スキーママイグレーション初期化ツール
// =====================================================================
//
// 役割：
//   1. PostgreSQL に接続
//   2. GORM AutoMigrate を使用して 8 つのテーブルを自動作成
//   3. テーブル間の外部キー（FK）制約を追加
//
// 実行方法：
//   $ go run ./cmd/migrate     （Go ソースから直接実行）
//   $ ./migrate                 （コンパイル後のバイナリ実行）
//
// 注意：
//   - このプログラムはスタンドアロン（API サーバーとは独立）
//   - 初回セットアップ時と DB リセット後に実行
//
// =====================================================================

func main() {
	// =====================
	// ステップ1: 環境変数読み込み
	// =====================
	// .env ファイルから DB 接続情報を環境変数として取得
	// 存在しない場合は OS の環境変数を使用（本番環境用）
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// =====================
	// ステップ2: DB 接続文字列（DSN）を構築
	// =====================
	// DSN = Data Source Name
	// PostgreSQL 接続に必要な情報を組み立てる
	//
	// 例：host=localhost port=5432 user=postgres password=postgres dbname=kurobasu sslmode=disable
	//
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		os.Getenv("DB_HOST"),      // DB サーバーアドレス（デフォルト: localhost）
		os.Getenv("DB_PORT"),      // ポート番号（デフォルト: 5432）
		os.Getenv("DB_USER"),      // ユーザー名（デフォルト: postgres）
		os.Getenv("DB_PASSWORD"),  // パスワード（デフォルト: postgres）
		os.Getenv("DB_NAME"),      // データベース名（デフォルト: kurobasu）
		os.Getenv("DB_SSLMODE"),   // SSL 接続設定（デフォルト: disable）
	)

	// =====================
	// ステップ3: PostgreSQL に接続
	// =====================
	// config.InitDB(dsn) が何をするか：
	//   1. GORM を初期化
	//   2. PostgreSQL ドライバーを使用して接続
	//   3. グローバル変数 config.DB に接続インスタンスを設定
	//   4. それ以降、このツールと API サーバーから config.DB を使用可能に
	//
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
		// fatalf = エラーメッセージ表示 + プログラム終了（exit code 1）
	}

	// =====================
	// ステップ4: マイグレーション実行
	// =====================
	// migration.RunMigrations() が何をするか：
	//   1. GORM AutoMigrate で 8 つのテーブルを自動作成
	//   2. Raw SQL でテーブル間の FK（外部キー）を設定
	//
	// 詳細は internal/migration/migration.go を参照
	if err := migration.RunMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// =====================
	// 完了メッセージ
	// =====================
	log.Println("All migrations completed successfully!")
	// このメッセージが表示されたら、DB スキーマセットアップ完了！
}

