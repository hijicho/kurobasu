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
PORT=8000
```

### 2. PostgreSQL デーベースを作成
```sql
CREATE DATABASE kurobasu;
```

### 3. 依存パッケージをインストール
```bash
go mod download
```

### 4. マイグレーション実行 & サーバー起動
```bash
go run main.go
```

## ディレクトリ構成
- `config/` - DB接続設定
- `models/` - GORMモデル定義
- `main.go` - エントリーポイント
