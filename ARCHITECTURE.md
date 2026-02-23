# Kurobasu バックエンド アーキテクチャガイド

## 📁 プロジェクト全体の構造

```
kurobasu/                                # ルートディレクトリ
│
├── cmd/                                 # 🎯実行可能なアプリケーション
│   ├── server/
│   │   └── main.go  ─────────────────> 「API サーバーのエントリーポイント」
│   │                                   - ポート 8000 で HTTP サーバーを起動
│   │                                   - DB 接続初期化
│   │                                   - ルーティング設定
│   │
│   └── migrate/
│       └── main.go  ─────────────────> 「DB スキーママイグレー션ツール」
│                                       - go run ./cmd/migrate で実行
│                                       - PostgreSQL にテーブルを作成
│                                       - FK（外部キー）制約を追加
│
├── internal/                            # 🔐 プライベート（内部用）パッケージ
│   │
│   ├── handlers/
│   │   └── handlers.go  ───────────────> 「HTTP リクエストハンドラー」
│   │                                   - 13 個の API エンドポイント実装
│   │                                   - リクエスト → ビジネスロジック → レスポンス
│   │                                   - repository 経由でデータアクセス
│   │
│   ├── repository/
│   │   └── repository.go  ─────────────> 「データアクセス層」
│   │                                   - 8 個のリポジトリクラス
│   │                                   - GORM を使用した DB 操作
│   │                                   - SQL を意識しプログラミング
│   │
│   ├── router/
│   │   └── router.go  ──────────────────> 「ルーティング設定」
│   │                                   - HTTP リクエストを正しいハンドラーに振り分け
│   │                                   - /api/v1/* のエンドポイント定義
│   │                                   - HTTP メソッド検証（GET/POST/PATCH）
│   │
│   ├── dto/
│   │   └── responses.go  ───────────────> 「データ転送オブジェクト」
│   │                                   - API レスポンスの JSON 構造定義
│   │                                   - DB モデルと API レスポンスを分離
│   │
│   └── migration/
│       └── migration.go  ────────────────> 「DB マイグレーション実行」
│                                       - GORM AutoMigrate でテーブル作成
│                                       - FK 制約を raw SQL で追加
│
├── config/                              # ⚙️  設定・初期化
│   └── database.go  ──────────────────> 「PostgreSQL 接続管理」
│                                       - グローバル変数 config.DB
│                                       - GORM 接続インスタンス
│                                       - アプリケーション全体で使用
│
├── models/                              # 🗄️  GORM モデル定義
│   ├── category.go         ────────────> カテゴリー（教育区分）
│   ├── subject.go          ────────────> 科目（授業）
│   ├── offering.go         ────────────> 開講情報（学期ごと、講師情報）
│   ├── meeting.go          ────────────> 授業時間割（曜日・時限）
│   ├── review.go           ────────────> 授業評価・クチコミ
│   ├── user.go             ────────────> ユーザー（Firebase 認証）
│   ├── timetable.go        ────────────> 時間割
│   └── timetable_item.go   ────────────> 時間割項目（どの授業を登録したか）
│
├── docs/                                # 📖 ドキュメント
│   ├── database.md         ────────────> DB スキーマ定義
│   └── screen_api_map.md   ────────────> API エンドポイント一覧
│
├── go.mod                               # Go モジュール定義ファイル
├── go.sum                               # Go モジュール チェックサム
├── .env                                 # 環境変数（開発用）
├── .gitignore                           # Git で無視するファイル
├── README.md                            # プロジェクト説明
└── BACKEND_README.md                    # バックエンド説明
```

---

## 🔄 データフロー（実行時の流れ）

### 1. サーバー起動時

```
$ go run ./cmd/server

↓ cmd/server/main.go が実行

  ├─ .env ファイルを読み込み
  │
  ├─ config.InitDB(dsn) を実行
  │  └─ config/database.go で PostgreSQL に接続
  │     └─ グローバル変数 config.DB に GORM インスタンスを設定
  │
  ├─ router.SetupRoutes() を実行
  │  └─ internal/router/router.go ですべての API ルートを登録
  │
  └─ http.ListenAndServe(":8000", mux) で待機開始
     └─ localhost:8000 でリクエスト受け付け
```

### 2. API リクエスト処理

```
例：GET http://localhost:8000/api/v1/categories

↓ HTTP リクエスト受信

  ├─ router.SetupRoutes() がパスをマッチング
  │
  ├─ handlers.ListCategories() が呼び出される
  │  └─ internal/handlers/handlers.go
  │
  ├─ repository.CategoryRepository.GetAllCategories() を呼び出し
  │  └─ internal/repository/repository.go
  │
  ├─ config.DB を使用して PostgreSQL から SELECT
  │  └─ config/database.go の GORM インスタンス
  │
  ├─ []models.Category が取得される
  │  └─ models/category.go
  │
  ├─ []dto.CategoryResponse に変換
  │  └─ internal/dto/responses.go
  │
  └─ JSON で HTTP レスポンス返却
     └─ {"data":{"items":[...]}}
```

### 3. DB マイグレーション

```
$ go run ./cmd/migrate

↓ cmd/migrate/main.go が実行

  ├─ config.InitDB(dsn) で DB 接続
  │
  ├─ migration.RunMigrations() を実行
  │  └─ internal/migration/migration.go
  │
  ├─ GORM AutoMigrate で以下を作成
  │  ├─ categories テーブル
  │  ├─ subjects テーブル
  │  ├─ offerings テーブル
  │  ├─ meetings テーブル
  │  ├─ reviews テーブル
  │  ├─ users テーブル
  │  ├─ timetables テーブル
  │  └─ timetable_items テーブル
  │
  └─ Raw SQL で FK（外部キー）制約を追加
     ├─ subjects.category_id → categories.category_id
     ├─ offerings.subject_id → subjects.subject_id
     ├─ meetings.offering_id → offerings.offering_id
     ├─ reviews.offering_id → offerings.offering_id
     ├─ timetables.user_id → users.user_id
     └─ timetable_items 関連の FK
```

---

## 📂 各フォルダ詳細解説

### ✅ `cmd/` - コマンド（実行可能なアプリケーション）

**役割**: スタンドアロンで実行できるプログラム

- **`cmd/server/main.go`**
  - **用途**: API サーバーの起動
  - **実行**: `go run ./cmd/server` または `./server`
  - **責務**:
    1. 環境変数読み込み
    2. DB 接続初期化（`config.InitDB`）
    3. ルーティング設定（`router.SetupRoutes`）
    4. HTTP サーバー起動（ポート 8000）

- **`cmd/migrate/main.go`**
  - **用途**: DB スキーママイグレーション
  - **実行**: `go run ./cmd/migrate`
  - **責務**:
    1. DB 接続
    2. すべてのモデルテーブル作成
    3. FK 制約追加

---

## 🗄️ `cmd/migrate/main.go` 詳細解説

### 概要

このファイルは **スタンドアロンな DB 初期化ツール** です。

```bash
# 実行方法
go run ./cmd/migrate

# または
./migrate  # バイナリが存在する場合
```

**役割**: PostgreSQL データベースに必要なテーブルを作成し、テーブル間の関連性を設定する。

---

### 処理フロー

```
$ go run ./cmd/migrate

↓

1️⃣ 環境変数読み込み
   └─ .env ファイルから DB 接続情報を取得

↓

2️⃣ DB 接続文字列（DSN）を構築
   └─ host, port, user, password, dbname を組み合わせ

↓

3️⃣ PostgreSQL に接続
   └─ config.InitDB(dsn) を実行
      └─ GORM が DB 接続を確立

↓

4️⃣ GORM AutoMigrate でテーブル作成
   └─ internal/migration/migration.go の RunMigrations() 実行
      8つのテーブルが順番に作成される

↓

5️⃣ Foreign Key（外部キー）制約を追加
   └─ Raw SQL で ALTER TABLE を実行
      テーブル間の関連性を明示

↓

✅ 完了「All migrations completed successfully!」
```

---

### ファイル内容の詳細分析

#### 1️⃣ **環境変数の読み込み**

```go
if err := godotenv.Load(); err != nil {
    log.Println("Warning: .env file not found, using environment variables")
}
```

**やっていること**:
- `.env` ファイルから環境変数をロード
- ファイルが存在しない場合は OS 環境変数を使用
- エラーインします（続行可能）

**`.env` ファイルの例**:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=kurobasu
DB_SSLMODE=disable
```

---

#### 2️⃣ **DB 接続文字列（DSN）の構築**

```go
dsn := fmt.Sprintf(
    "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
    os.Getenv("DB_HOST"),
    os.Getenv("DB_PORT"),
    os.Getenv("DB_USER"),
    os.Getenv("DB_PASSWORD"),
    os.Getenv("DB_NAME"),
    os.Getenv("DB_SSLMODE"),
)
```

**DSN とは**: Data Source Name（データソース名）

**構築例**:
```
host=localhost port=5432 user=postgres password=postgres dbname=kurobasu sslmode=disable
```

このような形式の文字列を `fmt.Sprintf` で生成。

**各フィールドの意味**:
| フィールド | 例 | 説明 |
|-----------|---|------|
| `host` | `localhost` | DB サーバーのアドレス |
| `port` | `5432` | PostgreSQL のポート番号 |
| `user` | `postgres` | DB ユーザー名 |
| `password` | `postgres` | DB パスワード |
| `dbname` | `kurobasu` | 作成する DB 名 |
| `sslmode` | `disable` | SSL 接続（本番は enable） |

---

#### 3️⃣ **PostgreSQL に接続**

```go
if err := config.InitDB(dsn); err != nil {
    log.Fatalf("Failed to connect to database: %v", err)
}
```

**`config.InitDB(dsn)` の処理** (config/database.go):

```go
func InitDB(dsn string) error {
    var err error
    // GORM を使用して PostgreSQL に接続
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return err
    }
    log.Println("Database connected successfully")
    return nil
}
```

**接続に失敗した場合**:
- `log.Fatalf()` でエラーメッセージを表示
- プログラムを終了（exit code 1）

❌ **例: 接続失敗時**
```
Failed to connect to database: dial tcp 127.0.0.1:5432: connection refused
```

---

#### 4️⃣ **マイグレーション実行**

```go
if err := migration.RunMigrations(); err != nil {
    log.Fatalf("Failed to run migrations: %v", err)
}
```

**`migration.RunMigrations()` の処理** (internal/migration/migration.go):

```go
func RunMigrations() error {
    // ステップ1: テーブルを自動作成
    err := config.DB.AutoMigrate(
        &models.Category{},
        &models.Subject{},
        &models.Offering{},
        &models.Meeting{},
        &models.Review{},
        &models.User{},
        &models.Timetable{},
        &models.TimetableItem{},
    )
    if err != nil {
        return err
    }
    
    // ステップ2: FK 制約を追加
    // (詳細は後述)
    
    return nil
}
```

---

### テーブル作成の仕組み（GORM AutoMigrate）

GORM の `AutoMigrate` は、Go 構造体の定義から自動的に SQL を生成します。

#### **例: Category モデル**

```go
// models/category.go
type Category struct {
    CategoryID int64  `gorm:"primaryKey;column:category_id"`
    Slug       string `gorm:"uniqueIndex;column:slug;not null"`
    Name       string `gorm:"column:name;not null"`
    SortOrder  int    `gorm:"column:sort_order;not null;default:0"`
}
```

#### **GORM が生成する SQL** 

```sql
CREATE TABLE categories (
    category_id BIGSERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sort_order BIGINT NOT NULL DEFAULT 0
);
```

**タグの意味**:
| タグ | 意味 |
|-----|------|
| `primaryKey` | 主キー（一意の識別子） |
| `column:name` | テーブルのカラム名 |
| `not null` | NULL 許可しない |
| `default:0` | デフォルト値 |
| `uniqueIndex` | ユニークインデックス |

---

### Foreign Key（FK）制約の追加

**テーブル作成後、Raw SQL で FK 制約を手動追加**:

```go
config.DB.Exec(`
    ALTER TABLE subjects 
    ADD CONSTRAINT fk_subjects_category 
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
`)
```

#### **FK とは**: Foreign Key（外部キー）

**役割**: テーブル間の関連性を定義

**例: subjects テーブルと categories テーブルの関係**

```
categories テーブル
┌───────────────┐
│ category_id   │  ← 1
│ slug          │
│ name          │
└───────────────┘
       ▲
       │ 参照
       │
subjects テーブル
┌───────────────┐
│ subject_id    │
│ category_id   │  ← 外部キー（categories.category_id を参照）
│ title         │
└───────────────┘
```

**FK 作成の SQL**:
```sql
ALTER TABLE subjects 
ADD CONSTRAINT fk_subjects_category 
FOREIGN KEY (category_id)           -- subjects の どのカラム
REFERENCES categories(category_id)  -- categories の どのカラムを参照するか
ON DELETE CASCADE                    -- categories の行が削除された時、subjects も自動削除
```

#### **実装されているすべての FK 制約**

```
1. subjects.category_id → categories.category_id
   （科目 → カテゴリー）

2. offerings.subject_id → subjects.subject_id
   （開講情報 → 科目）

3. meetings.offering_id → offerings.offering_id
   （授業時間割 → 開講情報）

4. reviews.offering_id → offerings.offering_id
   （授業評価 → 開講情報）

5. timetables.user_id → users.user_id
   （時間割 → ユーザー）

6. timetable_items.timetable_id → timetables.timetable_id
   （時間割項目 → 時間割）

7. timetable_items.offering_id → offerings.offering_id
   （時間割項目 → 開講情報）
```

**`ON DELETE CASCADE` の意味**:
- 親テーブルの行が削除される
- → 子テーブルの関連する行も自動削除

**例**:
```sql
-- categories の id=1 を削除
DELETE FROM categories WHERE category_id = 1;

-- すると、自動的に以下も削除される
DELETE FROM subjects WHERE category_id = 1;
DELETE FROM offerings WHERE subject_id IN (削除された subjects の id);
... など連鎖削除
```

---

#### **なぜ GORM AutoMigrate では FK を作らずに Raw SQL で作るのか？**

GORM の AutoMigrate は便利ですが、複雑な FK 制約（特に `ON DELETE CASCADE`）は確実に設定できない場合があります。

→ そのため、Raw SQL で明示的に設定しています

```go
// 直接 SQL を実行
config.DB.Exec(`ALTER TABLE ... ADD CONSTRAINT ...`)
```

---

#### 5️⃣ **完了メッセージ**

```go
log.Println("All migrations completed successfully!")
```

✅ **成功時の出力**:
```
Database connected successfully
All migrations completed successfully!
```

---

### 実行例

#### **初回実行（テーブルが存在しない場合）**

```bash
$ go run ./cmd/migrate

2026/02/20 18:37:27 Database connected successfully
2026/02/20 18:37:27 All migrations completed successfully!
```

**PostgreSQL で確認**:
```bash
$ psql -d kurobasu -c "\d"

          List of relations
 Schema |      Name       | Type  
--------+-----------------+-------
 public | categories      | table
 public | subjects        | table
 public | offerings       | table
 public | meetings        | table
 public | reviews         | table
 public | users           | table
 public | timetables      | table
 public | timetable_items | table
```

#### **2回目実行（テーブルが既に存在する場合）**

```bash
$ go run ./cmd/migrate

2026/02/20 18:40:15 Database connected successfully
2026/02/20 18:40:15 All migrations completed successfully!
```

**GORM は既存テーブルを自動的に検知して、追加のテーブル作成やスキーマアップデートのみを実行**

---

### エラーハンドリング

注意すべきエラーパターン:

#### **❌ DB 接続失敗**
```
Failed to connect to database: dial tcp 127.0.0.1:5432: connection refused
```
→ PostgreSQL が起動していない、または接続情報が誤っている

#### **❌ FK 制約エラー（2回目以降）**
```
ERROR: relation "subjects" does not exist (SQLSTATE 42P01)
```
→ 通常は発生しません（既存テーブルは変更されず）

---

### cmd/server/main.go との関係性

| ファイル | 役割 | タイミング |
|---------|------|-----------|
| **cmd/migrate/main.go** | テーブル作成・FK 設定 | **初回セットアップ** |
| **cmd/server/main.go** | API サーバー起動 | **毎回起動** |

```
1️⃣ 初回のみ実行
   $ go run ./cmd/migrate   ← テーブル作成

2️⃣ 以降は毎回実行
   $ go run ./cmd/server    ← API サーバー起動
   または ./server
```

---

### 実務的な使用シーン

#### **シーン1: 開発環境での初期セットアップ**
```bash
# 1. PostgreSQL を起動
$ pg_isready
accepting connections

# 2. マイグレーション実行
$ go run ./cmd/migrate
Database connected successfully
All migrations completed successfully!

# 3. API サーバーを起動
$ go run ./cmd/server
Server starting on port 8000
```

#### **シーン2: 本番環境への デプロイ**
```bash
# 本番 DB の接続情報を環境変数で指定
$ export DB_HOST=prod-db.example.com
$ export DB_USER=prod_user
$ export DB_PASSWORD=xxx

# マイグレーション実行
$ ./migrate

# サーバー起動
$ ./server
```

#### **シーン3: DB リセット（開発時）**
```bash
# 全テーブル削除
$ psql -d kurobasu -c "DROP TABLE IF EXISTS timetable_items, timetables, reviews, meetings, offerings, subjects, users, categories CASCADE;"

# 再度マイグレーション
$ go run ./cmd/migrate
```

---

### まとめ

**`cmd/migrate/main.go` の本質**:

1. **環境変数から DB 接続情報を抽出**
2. **PostgreSQL に接続**
3. **Go モデル定義から SQL を自動生成（GORM）**
4. **8つのテーブルを作成**
5. **Raw SQL で テーブル間の関連性（FK）を設定**

> 一言で言えば: **「DB スキーマの初期化ツール」**

### 🔐 `internal/` - 内部パッケージ（プライベート）

Go では `internal/` ディレクトリ配下のコードは、このモジュール内でのみ import 可能。外部パッケージからはアクセス不可。

#### **`internal/handlers/` - HTTP ハンドラー層**

**役割**: HTTP リクエストを受け取り、ビジネスロジック実行、レスポンス返却

```
HTTP Request
    ↓
handlers.ListCategories(w, r)  ← ここで処理
    ↓
1. リクエストパースと検証
2. repository を使用してデータ取得
3. DTO に変換
4. JSON で応答
```

**13 個の API ハンドラー**:
- 「カテゴリー}: ListCategories
- 「開講情報}: ListOfferingsByCategory, GetOffering
- 「授業評価}: ListReviews, CreateReview, GetReview
- 「認証}: BootstrapUser, GetCurrentUser, UpdateCurrentUser
- 「時間割}: CreateTimetable, GetTimetable, UpdateTimetable
- 「メタ}: GetDefaultAcademicYear

#### **`internal/repository/` - データアクセス層**

**役割**: DB 操作を集中管理。ハンドラーは直接 SQL を書かない

```
handler
    ↓
repository.CategoryRepository.GetAllCategories()  ← ここで DB 操作
    ↓
SQL 実行（GORM が SQL 生成）
    ↓
Data 返却
```

**8 個のリポジトリクラス**:
- CategoryRepository
- SubjectRepository
- OfferingRepository
- MeetingRepository
- ReviewRepository
- UserRepository
- TimetableRepository
- TimetableItemRepository

**メリット**:
- DB 操作ロジックを一箇所に集約
- SQL の複雑さを隠蔽
- テスト時はモック実装に置き換え可能

#### **`internal/router/` - ルーティング層**

**役割**: HTTP リクエスト URL → ハンドラー関数へのマッピング

```
GET /api/v1/categories
    ↓
router.SetupRoutes() が登録した規則によってマッチ
    ↓
handlers.ListCategories を呼び出し
```

**やっていること**:
1. `/api/v1/*` パターンを定義
2. HTTP メソッド（GET, POST, PATCH）を検証
3. 正しいハンドラーに振り分け

#### **`internal/dto/` - DTO（データ転送オブジェクト）**

**役割**: API リクエスト/レスポンスのデータ構造を定義

**DB モデルとの違い**:
```
models.Category          dto.CategoryResponse
(DB テーブル)           (API レスポンス)
─────────────────────────────────────────
すべてのフィールド       必要なフィールドだけ
DB 内部実装              外部インターフェース
```

**利点**:
- DB スキーマ変更時、API は影響受けない
- 必要な情報のみクライアントに送付
- セキュリティ（内部情報非公開）

#### **`internal/migration/` - マイグレーション実行**

**役割**: DB テーブル作成・更新ロジック

```go
config.DB.AutoMigrate(
    &models.Category{},
    &models.Subject{},
    ...
)
```

- GORM が自動的に CREATE TABLE SQL を生成
- スキーマ定義は models/* ファイルに記載

---

### 🗄️ `models/` - GORM モデル定義

**役割**: DB テーブルとアプリケーション内の Go 構造体をマッピング

```
PostgreSQL テーブル  ←→  Go struct
─────────────────────────────────
id (BIGINT)          ←→  int64 型フィールド
name (VARCHAR)       ←→  string 型フィールド
created_at (TIMESTAMP) ←→  time.Time 型フィールド
```

**構造体タグ例**:
```go
type Category struct {
    CategoryID int64 `gorm:"primaryKey;column:category_id"`
    //          ┬─────────────────────────────────────┘
    //          └─ GORM タグ: DB マッピング指定
    //            - primaryKey: 主キー
    //            - column: テーブルのカラム名
}
```

**8 個のモデル**:

1. **Category** - 教育区分（一般教育、工学部など）
2. **Subject** - 科目（プログラミング入門など）
3. **Offering** - 開講情報（ある学期の特定の講師との開講）
4. **Meeting** - 授業時間割（月3限など）
5. **Review** - 授業評価クチコミ
6. **User** - ユーザー（Firebase 認証）
7. **Timetable** - 時間割（ユーザーが作成した自分の時間割）
8. **TimetableItem** - 時間割項目（どの授業を時間割に登録したか）

---

### ⚙️ `config/` - 設定・初期化

**役割**: アプリケーション全体で使用する共有リソースの初期化

```go
package config

var DB *gorm.DB  // グローバル変数

func InitDB(dsn string) error {
    // PostgreSQL に接続
    DB, err = gorm.Open(...)
    return err
}
```

**使用方法**:
```go
// どこからでも使用可能
config.DB.Find(&categories)
```

---

### 📖 `docs/` - ドキュメント

- **`database.md`** - DB スキーマ定義、テーブル構造
- **`screen_api_map.md`** - API エンドポイント一覧、リクエスト/レスポンス仕様

---

## 🏗️ レイヤー構造（オニオンアーキテクチャ的）

```
┌─────────────────────────────────┐
│      HTTP Router                │  ← request を正しい handler に振り分け
│  (internal/router/router.go)    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      HTTP Handlers              │  ← request/response 処理
│  (internal/handlers/handlers.go)│
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      DTOs                       │  ← JSON シリアライズ/デシリアライズ
│  (internal/dto/responses.go)    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Repository (DAL)           │  ← DB 操作
│  (internal/repository/...)      │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      Config & Database          │  ← DB 接続
│  (config/database.go)           │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│      PostgreSQL                 │  ← 実データベース
└─────────────────────────────────┘
```

---

## 📊 main.go の実行フロー

```
go run ./cmd/server

↓

cmd/server/main.go:main()
├─ .env 読み込み
├─ config.InitDB()
│  └─ PostgreSQL 接続（config.DB グローバル変数設定）
├─ router.SetupRoutes()
│  └─ すべての API ルート登録
├─ http.ListenAndServe(":8000", mux)
│  └─ ブロッキング：リクエスト待機
│     （ここに達したら起動完了 ✅ ）

← HTTP リクエスト受信時
├─ router が /api/v1/* にマッチしたら
├─ 対応する handler を実行
├─ repository で DB アクセス
├─ DTO で JSON 変換
└─ HTTP レスポンス返却
```

---

## 🎯 まとめ

| フォルダ | 役割 | 技術 |
|---------|------|------|
| `cmd/` | スタンドアロン実行アプリ | Go main |
| `internal/handlers` | HTTP request/response | net/http |
| `internal/repository` | DB 操作 | GORM |
| `internal/router` | URL → handler | net/http.ServeMux |
| `internal/dto` | JSON serialize | encoding/json |
| `config/` | 共有リソース初期化 | PostgreSQL/GORM |
| `models/` | DB スキーマ定義 | GORM tags |
| `docs/` | 仕様書 | Markdown |
