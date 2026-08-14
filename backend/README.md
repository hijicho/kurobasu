# kurobasu - Course Review Platform

大阪公立大学の授業感想・評価を学生から集めたプラットフォームのバックエンド API。

## 概要

- **言語**: Go 1.22
- **データベース**: PostgreSQL 16
- **ORM**: GORM
- **ポート**: 8080（API）
- **デプロイ**: Docker Compose

## 本番起動

### 前提条件

- [Docker](https://docs.docker.com/get-docker/) (23.0.0 以上)
- [Docker Compose](https://docs.docker.com/compose/install/) (1.29.0 以上)
- Supabase project（Postgres / Auth / Storage）

### セットアップ・起動

```bash
cd /home/hageruto/Projects/kurobasu

# 本番用 env を設定
cp .env.example .env

# イメージをビルドして API を起動
docker compose --env-file .env up --build -d
```

このコマンドで以下が自動実行されます：
1. Supabase Postgres に接続
2. テーブル作成・FK 制約追加（マイグレーション）
3. Go サーバーがポート 8080 で起動

本番起動では seed は実行しません。初期データ投入が必要な場合は、投入内容を確認したうえで別ジョブとして `./seed` を一度だけ実行してください。

**起動確認：**

```bash
curl https://your-api-domain.example/api/v1/categories
```

カテゴリの JSON が返ってくれば成功です。

---

## Docker Compose コマンド

```bash
# サービス起動
docker compose --env-file .env up --build -d

# ステータス確認
docker compose ps

# ログ確認
docker compose logs      # すべてのサービス
docker compose logs app  # API のみ

# サービス停止（データ保持）
docker compose down
```

---

## サーバー単体起動

Docker を使わずに起動する場合も、Supabase の本番環境変数を設定してから実行します。

```bash
cd /home/hageruto/Projects/kurobasu

go mod download
cp .env.example .env
go run ./cmd/migrate/main.go
go run ./cmd/server/main.go
```

### 認証

認証が必要な API は、Supabase Auth の access token を検証します。ユーザー ID をそのまま `Authorization: Bearer ...` に入れる開発用バイパスはありません。

Supabase Auth ではメール/パスワード認証に加えて、匿名サインインを有効にしてください。ゲストログインは Supabase Auth の匿名ユーザーとして作成されます。

バックエンドの `.env` には以下を設定します。

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
```

フロントエンドの `.env.local` には以下を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.example/api/v1
```

service role key はバックエンド専用です。フロントエンドに露出させないでください。

---

## API エンドポイント

### Categories（カテゴリ）

```bash
# 全カテゴリ取得
curl http://localhost:8080/api/v1/categories
```

**レスポンス例：**
```json
{
  "data": {
    "items": [
      {
        "category_id": 1,
        "slug": "science",
        "name": "Science",
        "sort_order": 1
      }
    ]
  }
}
```

### Meta（メタ情報）

```bash
# デフォルト学年度取得
curl http://localhost:8080/api/v1/meta/default-academic-year
```

### Auth（認証）

```bash
# ユーザーをBootstrap
curl -X POST http://localhost:8080/api/v1/auth/bootstrap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Supabase access token>" \
  -d '{"display_name": "Student Name"}'
```

`/api/v1/me` と `/api/v1/reviews` の作成系エンドポイントは `Authorization` ヘッダが必要です。値には Supabase Auth が発行した access token を指定します。

```bash
curl -H "Authorization: Bearer <Supabase access token>" http://localhost:8080/api/v1/me
```

**レスポンス例（`GET /api/v1/me`）:**

```json
{
  "data": {
    "user_id": 1,
    "display_name": "Alice Johnson",
    "created_at": "2026-06-29T12:34:56Z"
  }
}
```

### Reviews（授業評価）

```bash
# 授業の評価一覧
curl http://localhost:8080/api/v1/offerings/1/reviews

# 評価を作成
curl -X POST http://localhost:8080/api/v1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Supabase access token>" \
  -d '{
    "offering_id": 1,
    "pros": "説明がわかりやすかったです。",
    "cons": "課題量はやや多めでした。",
    "others": "初学者にもおすすめです。"
  }'
```

自分が作成したレビューの `status` を確認したい場合は、以下を使います。

```bash
# 自分のレビュー一覧を取得
curl -H "Authorization: Bearer <Supabase access token>" \
  http://localhost:8080/api/v1/me/reviews

# 自分のレビュー詳細を取得
curl -H "Authorization: Bearer <Supabase access token>" \
  http://localhost:8080/api/v1/me/reviews/1
```

**レスポンス例（一覧）:**

```json
{
  "data": {
    "reviews": [
      {
        "review_id": 1,
        "offering_id": 1,
        "comment": "この授業はわかりやすかったです。",
        "status": "pending",
        "created_at": "2026-06-29T12:34:56Z",
        "updated_at": "2026-06-29T12:34:56Z"
      }
    ],
    "count": 1
  }
}
```

**レスポンス例（詳細）:**

```json
{
  "data": {
    "review_id": 1,
    "offering_id": 1,
    "comment": "この授業はわかりやすかったです。",
    "status": "approved",
    "created_at": "2026-06-29T12:34:56Z",
    "updated_at": "2026-06-29T13:00:00Z"
  }
}
```

### Admin（管理画面）

管理画面 API は Supabase access token が必要です。`/admin/users` は `admin` ロールのみ、`/admin/reviews` と `/admin/ads` は `admin` / `editor` ロールで利用できます。

```bash
# 口コミ一覧
curl -H "Authorization: Bearer <Supabase access token>" \
  "http://localhost:8080/api/v1/admin/reviews?status=pending"

# 口コミを承認
curl -X PATCH http://localhost:8080/api/v1/admin/reviews/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Supabase access token>" \
  -d '{"status": "approved"}'

# 口コミを物理削除する
curl -X DELETE http://localhost:8080/api/v1/admin/reviews/1 \
  -H "Authorization: Bearer <Supabase access token>"

# 広告画像一覧
curl -H "Authorization: Bearer <Supabase access token>" \
  http://localhost:8080/api/v1/admin/ads

# 広告画像をアップロード
curl -X POST http://localhost:8080/api/v1/admin/ads \
  -H "Authorization: Bearer <Supabase access token>" \
  -F "academic_year=2026" \
  -F "term=spring" \
  -F "image=@./ad-banner.png"

# 広告画像を無効化
curl -X DELETE http://localhost:8080/api/v1/admin/ads/1 \
  -H "Authorization: Bearer <Supabase access token>"
```

広告画像は Supabase Storage の `SUPABASE_STORAGE_BUCKET` に保存され、DB には公開 URL と object path を保存します。

詳細な API 仕様は [ARCHITECTURE.md](ARCHITECTURE.md) を参照。

---

## ディレクトリ構成

```
kurobasu/
├── cmd/
│   ├── server/        # サーバーのエントリーポイント
│   ├── migrate/       # マイグレーション実行ツール
│   └── seed/          # シード実行ツール
├── config/            # DB 接続設定
├── internal/
│   ├── dto/           # リクエスト/レスポンス DTO
│   ├── handlers/      # HTTP ハンドラ（エンドポイント実装）
│   ├── migration/     # テーブル定義・FK 制約
│   ├── repository/    # データアクセス層
│   ├── router/        # ルーティング設定
│   └── seed/          # サンプルデータ投入
├── models/            # GORM モデル定義
├── Dockerfile         # Docker イメージ定義
├── docker-compose.yml # Docker Compose 設定
└── .env.example       # 環境変数テンプレート
```

---

## テスト実行

```bash
# すべてのテストを実行
go test ./...

# 特定パッケージのテストをVerboardose出力
go test ./tests -v
```

テスト前に以下が必要：
- PostgreSQL が起動中（接続確認のみ）
- `.env` ファイルが DB 接続情報を含む

詳細は [TESTING.md](TESTING.md) を参照。

---

## 環境変数

`.env` ファイルで設定（Docker Compose の場合は `docker-compose.yml` で定義）：

```env
# データベース
DB_HOST=db.<project-ref>.supabase.co
DB_PORT=5432             # PostgreSQL ポート
DB_USER=postgres         # PostgreSQL ユーザー
DB_PASSWORD=             # PostgreSQL パスワード
DB_NAME=postgres         # DB 名
DB_SSLMODE=require       # SSL モード

# サーバー
PORT=8000                # サーバーポート（Docker では 8080 に上書き）

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=       # access token 検証用
SUPABASE_SERVICE_ROLE_KEY= # Storage アップロード用。バックエンド専用

# 広告画像
SUPABASE_STORAGE_BUCKET=ads
SUPABASE_STORAGE_PUBLIC_BASE_URL=
```

---

## データベース構成

### テーブル

- **users** - ユーザー情報
- **categories** - 授業のカテゴリ（Science, Mathematics など）
- **subjects** - 科目（微積分、化学基礎など）
- **offerings** - 授業提供情報（科目 × 学期 × 教員）
- **meetings** - 授業の時間・場所
- **timetables** - 学生の時間割
- **timetable_items** - 時間割の授業
- **reviews** - 授業の評価・感想
- **ad_images** - 楽器別の広告画像

### 外部キー制約

- **subjects** → categories
- **offerings** → subjects
- **meetings** → offerings
- **reviews** → offerings
- **timetables** → users
- **timetable_items** → timetables, offerings

マイグレーション詳細は [internal/migration/migration.go](internal/migration/migration.go) を参照。

---

## トラブルシューティング

### サーバーが 8080 で起動しない

Docker Compose ログで確認：

```bash
docker compose logs app
```

ポート 8080 が既に使用中の場合、`docker-compose.yml` を編集：

```yaml
ports:
  - "8081:8080"  # ホスト:コンテナ
```

### キャッシュの問題でビルドが古い

```bash
# イメージ・キャッシュをリセット
sudo docker-compose down -v
sudo docker system prune -f
sudo docker-compose up --build
```

---

## 開発ガイド

### ハンドラの追加

1. `internal/handlers/{feature}.go` にハンドラ関数を追加
2. `internal/router/router.go` でルートを登録
3. テストを `tests/api_test.go` に追加

### リポジトリの追加

1. `internal/repository/{feature}.go` を作成
2. インターフェースを定義・実装
3. ハンドラから呼び出す

### マイグレーションの変更

1. `internal/migration/migration.go` で `AutoMigrate` または `ALTER TABLE` を追加
2. `go run ./cmd/migrate/main.go` で実行

詳細は [ARCHITECTURE.md](ARCHITECTURE.md) を参照。

---

## ライセンス

非公式プロジェクト（大阪公立大学の授業情報をベース）

---

## サポート

問題が発生した場合は、以下の順で確認：
1. [ARCHITECTURE.md](ARCHITECTURE.md) - 設計・実装の詳細
2. [TESTING.md](TESTING.md) - テスト方法
3. Docker Compose ログ: `sudo docker-compose logs`
