# kurobasu - Course Review Platform

大阪公立大学の授業感想・評価を学生から集めたプラットフォームのバックエンド API。

## 概要

- **言語**: Go 1.22
- **データベース**: PostgreSQL 16
- **ORM**: GORM
- **ポート**: 8080（API）
- **デプロイ**: Docker Compose

## クイックスタート

### 前提条件

- [Docker](https://docs.docker.com/get-docker/) (23.0.0 以上)
- [Docker Compose](https://docs.docker.com/compose/install/) (1.29.0 以上)

### セットアップ・起動（推奨：Docker Compose）

```bash
cd /home/hageruto/Projects/kurobasu

# イメージをビルドしてサービス起動
sudo docker-compose up --build
```

このコマンドで以下が自動実行されます：
1. PostgreSQL 16 がポート 5432 で起動
2. テーブル作成・FK 制約追加（マイグレーション）
3. サンプルデータ投入（シード）
4. Go サーバーがポート 8080 で起動

**起動確認：**

```bash
curl http://localhost:8080/api/v1/categories
```

カテゴリの JSON が返ってくれば成功です。

---

## Docker Compose コマンド

```bash
# サービス起動
sudo docker-compose up --build

# バックグラウンド起動
sudo docker-compose up -d --build

# ステータス確認
sudo docker-compose ps

# ログ確認
sudo docker-compose logs          # すべてのサービス
sudo docker-compose logs app      # アプリケーションのみ
sudo docker-compose logs db       # DB のみ

# サービス停止（データ保持）
sudo docker-compose down

# サービス停止・データ削除
sudo docker-compose down -v

# 完全リセット（イメージ・キャッシュも削除）
sudo docker-compose down -v
sudo docker system prune -f
sudo docker-compose up --build
```

---

## ローカル開発（Docker なし）

### 前提条件

- Go 1.22 以上
- PostgreSQL 16 がローカルで起動中

### セットアップ

```bash
cd /home/hageruto/Projects/kurobasu

# 依存パッケージをInstall
go mod download

# 環境変数を設定
cp .env.example .env

# マイグレーション実行
go run ./cmd/migrate/main.go

# シード実行
go run ./cmd/seed/main.go

# サーバー起動
go run ./cmd/server/main.go
```

サーバーがポート 8000 で起動します（ローカル開発用のデフォルト）。

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
  -d '{"display_name": "Student Name"}'
```

`/api/v1/me` と `/api/v1/reviews` の作成系エンドポイントは `Authorization` ヘッダが必要です。開発用実装では Firebase UID をそのままトークンとして扱っているため、次のように指定します。

```bash
curl -H "Authorization: Bearer seed_user_alice" http://localhost:8080/api/v1/me
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
  -d '{
    "offering_id": 1,
    "comment": "この授業はわかりやすかったです。"
  }'
```

自分が作成したレビューの `status` を確認したい場合は、以下を使います。

```bash
# 自分のレビュー一覧を取得
curl -H "Authorization: Bearer seed_user_alice" \
  http://localhost:8080/api/v1/me/reviews

# 自分のレビュー詳細を取得
curl -H "Authorization: Bearer seed_user_alice" \
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
DB_HOST=localhost        # PostgreSQL ホスト
DB_PORT=5432             # PostgreSQL ポート
DB_USER=postgres         # PostgreSQL ユーザー
DB_PASSWORD=password     # PostgreSQL パスワード
DB_NAME=kurobasu         # DB 名
DB_SSLMODE=disable       # SSL モード

# サーバー
PORT=8000                # サーバーポート（Docker では 8080 に上書き）
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

### ポート 5432 が既に使用中

```bash
# ローカル PostgreSQL を停止
sudo systemctl stop postgresql

# Docker Compose を再起動
sudo docker-compose down -v
sudo docker-compose up --build
```

### サーバーが 8080 で起動しない

Docker Compose ログで確認：

```bash
sudo docker-compose logs app
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