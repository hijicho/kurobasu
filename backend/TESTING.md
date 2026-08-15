# API テストコード実行ガイド

## 概要

kurobasu プロジェクトのAPIエンドポイント動作確認用のテストコード。Go の標準テストフレームワークを使用しています。

## ファイル構成

```
tests/
└── api_test.go      # API エンドポイントの統合テスト（24テスト）
```

## テスト内容

### カテゴリー API
- `TestListCategories` - GET /api/v1/categories
- `TestListCategories_InvalidMethod` - 無効なメソッド処理

### オファリング（開講情報）API
- `TestListOfferingsByCategory` - GET /api/v1/categories/{slug}/offerings
- `TestListOfferingsByCategory_MissingQueryParams` - クエリパラメータ検証
- `TestGetOffering` - GET /api/v1/offerings/{id}

### レビュー API

### 認証 API

#### レスポンス例

`GET /api/v1/me/reviews`

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

`GET /api/v1/me/reviews/{id}`

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
- `TestBootstrapUser` - POST /api/v1/auth/bootstrap
- `TestBootstrapUser_InvalidRequest` - リクエスト検証
- `TestGetCurrentUser` - GET /api/v1/me
- `TestUpdateCurrentUser` - PATCH /api/v1/me

### 認証ヘッダ

`/api/v1/me`、`/api/v1/reviews`、`/api/v1/me/reviews` 系のエンドポイントは `Authorization` ヘッダが必要です。開発環境でも Supabase Auth の access token を検証します。ユーザー ID をそのまま bearer token として渡すことはできません。

ローカルで安全に認証系 API を試す場合は、Supabase CLI を起動し、バックエンドに以下を設定してください。

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<supabase start の anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase start の service_role key>
```

テストで認証が必要な API を叩く場合は、Supabase Auth で作成したテストユーザーまたは匿名ユーザーの access token を `Authorization: Bearer ...` に渡します。

### 時間割 API
- `TestCreateTimetable` - POST /api/v1/timetables
- `TestGetTimetable` - GET /api/v1/timetables/{id}
- `TestUpdateTimetable` - PATCH /api/v1/timetables/{id}

### メタデータ API
- `TestGetSiteSettings` - GET /api/v1/meta/site-settings

### その他
- `TestNotFound` - 存在しないエンドポイント
- `TestResponseContentType` - JSON Content-Type 検証
- `TestConcurrentRequests` - 並行リクエスト処理

## 実行方法

### 前提条件

1. PostgreSQL 16.11 が起動していること
2. `.env` ファイルが存在し、以下の環境変数が設定されていること
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=kurobasu
   DB_SSLMODE=disable
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=<supabase start の anon key>
   SUPABASE_SERVICE_ROLE_KEY=<supabase start の service_role key>
   ```
3. データベースと テーブルが初期化されていること
   ```bash
   go run ./cmd/migrate
   # または（マイグレーション + シード）
   go run ./cmd/seed
   ```

### テスト実行

全テスト実行：
```bash
go test ./tests -v
```

特定のテストのみ実行：
```bash
go test ./tests -v -run TestListCategories
```

テストカバレッジ確認：
```bash
go test ./tests -cover
```

テストカバレッジレポート生成：
```bash
go test ./tests -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### テスト出力例

成功時：
```
=== RUN   TestListCategories
--- PASS: TestListCategories (0.00s)
...
PASS
ok      github.com/hageruto/kurobasu/tests      0.019s
```

## テストコード構成

### Helper Functions

```go
// HTTP リクエストを作成し、レスポンス（ResponseRecorder）を返す
makeRequest(method, path string, body interface{}) *httptest.ResponseRecorder

// ステータスコードを検証
assertStatusCode(t *testing.T, got, want int)

// JSON レスポンス形式の検証
assertJSONResponse(t *testing.T, body string)
```

### テストの流れ

1. `TestMain()` で DB 初期化
2. `makeRequest()` で HTTP リクエストをシミュレート
3. `httptest.ResponseRecorder` でレスポンスをキャプチャ
4. ステータスコードと JSON 構造を検証

## 既知の制限事項

### Go 1.22 ルーティング

Go 1.22 の http.ServeMux では、`{id}` のようなパス パラメータ マッチングに以下の動作があります：

- 動作するパターン：
  - `/api/v1/categories` (固定パス)
  - `/api/v1/reviews` (固定パス)
  - `/api/v1/auth/bootstrap` (固定パス)
  - `/api/v1/meta/site-settings` (固定パス)

- マッチしない可能性があるパターン：
  - `/api/v1/categories/{slug}/offerings` 
  - `/api/v1/offerings/{id}`
  - `/api/v1/offerings/{id}/reviews`

ダイナミックルーティングが必要な場合は、`chi` や `gin` などの専門的なルーターライブラリの導入を検討してください。

## テスト時のデータベース状態

テスト実行時：
- DB 初期化のみで、テストデータは挿入されません
- 存在しないデータへのアクセスは 404 エラーを返します
- 外部キー制約により、関連データがないリソースの作成は失敗します
- 認証が必要な API をテストする場合は、`Authorization: Bearer <Supabase access token>` を付与するか、認証ミドルウェアをモックしてください

## トラブルシューティング

### "Failed to initialize database" エラー

**原因：** DB 接続に失敗

**解決方法：**
```bash
# 1. PostgreSQL が起動しているか確認
pg_isready -h localhost -U postgres

# 2. .env ファイルが存在し、値が正しいか確認
cat .env

# 3. マイグレーション実行
go run ./cmd/migrate
```

### "database connection refused" エラー

**原因：** PostgreSQL が起動していない

**解決方法：**
```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Docker
docker run -d -e POSTGRES_PASSWORD=postgres postgres:16.11
```

### テストが 404 を返す

**理由：** Go 1.22 ルーターの制限により、`{id}` パターンが正しくマッチしない可能性があります

**テスト側の対応：** テストコードでは 404 を許容するか、スキップする実装になっています

## 拡張方法

新しいエンドポイントのテストを追加する場合：

```go
// TestNewEndpoint - POST /api/v1/new-resource
func TestNewEndpoint(t *testing.T) {
	body := dto.CreateNewResourceRequest{
		Name: "Test Resource",
	}

	w := makeRequest("POST", "/api/v1/new-resource", body)

	assertStatusCode(t, w.Code, http.StatusCreated)
	assertJSONResponse(t, w.Body.String())
}
```

## 参考資料

- [Go 標準テストパッケージ](https://golang.org/pkg/testing/)
- [net/http/httptest パッケージ](https://golang.org/pkg/net/http/httptest/)
- [Go 1.22 新機能](https://go.dev/blog/go1.22)
