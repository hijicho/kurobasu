# kurobasu Backend

Go + GORM + PostgreSQL を使った大阪公立大学の授業評価APIサーバー

## セットアップ

### 1. `.env` ファイルを作成
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=kurobasu
DB_SSLMODE=disable
PORT=8000
```

### 2. PostgreSQL デーベースを作成
```bash
createdb kurobasu
```

### 3. 依存パッケージをインストール
```bash
go mod download
```

### 4. マイグレーション実行
```bash
make migrate
# または
go run ./cmd/migrate
```

### 5. サーバー起動
```bash
make run
# または
go run ./cmd/server
```

## ディレクトリ構成
- `cmd/` - 実行可能バイナリのエントリーポイント
  - `server/` - APIサーバー
  - `migrate/` - DBマイグレーション
- `config/` - DB接続設定
- `models/` - GORMモデル定義
- `internal/` - 内部パッケージ
  - `handlers/` - HTTPハンドラー
  - `router/` - ルーティング設定
  - `migration/` - マイグレーションロジック 
- `.env` - 環境変数設定（git ignore）

## コマンド

```bash
make help      # ヘルプ表示
make run       # サーバー起動
make migrate   # マイグレーション実行
make clean     # ビルド成果物削除
```
