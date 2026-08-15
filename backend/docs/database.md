# DBスキーマ案（1〜8）: categories / subjects / offerings / meetings / reviews / users / timetables / timetable_items

前提：
- **カテゴリはフラット**（「般教」「工学部」「法学部」…をすべて `categories` に入れます）
- 年度切替のために **科目（`subjects`）** を導入します（同一科目を年度横断で束ねます）
- `instructor` は **配列**（`offerings.instructor_names` を `text[]`）で持ちます
- PostgreSQL を想定します

---

## 1) categories（カテゴリ）

**用途**：一覧表示、フィルタ（例：般教だけ＝`slug='general'`）

| カラム | 型 | 制約/補足 |
|---|---|---|
| category_id | BIGSERIAL | PK |
| slug | TEXT | NOT NULL, UNIQUE（例：`general`, `engineering`, `law`） |
| name | TEXT | NOT NULL（表示名：般教、工学部、法学部…） |
| sort_order | INT | NOT NULL, DEFAULT 0（任意：表示順） |

---

## 2) subjects（科目：年度切替の親）

**用途**：同一科目の年度切替を `subject_id` で実現します

| カラム | 型 | 制約/補足 |
|---|---|---|
| subject_id | BIGSERIAL | PK |
| category_id | BIGINT | NOT NULL, FK → categories(category_id) |
| title | TEXT | NOT NULL（科目名） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()（任意だが推奨） |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()（任意だが推奨） |

推奨ユニーク（任意）：
- `UNIQUE(category_id, title)`（同カテゴリ内で同名科目を重複させない）

---

## 3) offerings（年度カタログ：年度・学期の開講実体）

**用途**：年度・学期ごとの開講情報（形態・担当など）を保持します

| カラム | 型 | 制約/補足 |
|---|---|---|
| offering_id | BIGSERIAL | PK |
| subject_id | BIGINT | NOT NULL, FK → subjects(subject_id) |
| academic_year | SMALLINT | NOT NULL（例：2026） |
| term | term_enum | NOT NULL（spring/fall） |
| modality | modality_enum | NOT NULL, DEFAULT 'unknown'（onsite/online/hybrid/unknown） |
| course_code | VARCHAR(40) | NOT NULL, DEFAULT ''（時間割表の授業コード。クラス・学期ごとに異なるため subject ではなく offering 側で持つ） |
| note | VARCHAR(120) | NOT NULL, DEFAULT ''（時間割表の備考欄。例：抽選、不開講、通年） |
| instructor_names | TEXT[] | NOT NULL, DEFAULT '{}'（教員名配列） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()（任意だが推奨） |

重要制約：
- `UNIQUE(subject_id, academic_year, term)`

補足（将来の並行開講対応）：
- 同一年度・同一学期で A/B クラスなどが出る場合は `section TEXT` を追加して  
  `UNIQUE(subject_id, academic_year, term, section)` にするのがおすすめです。

---

## 4) meetings（開講情報：曜日・時限）

**用途**：同一 offering に対し、週2回など複数コマを持てます

| カラム | 型 | 制約/補足 |
|---|---|---|
| meeting_id | BIGSERIAL | PK |
| offering_id | BIGINT | NOT NULL, FK → offerings(offering_id), ON DELETE CASCADE |
| day | SMALLINT | NOT NULL（1=Mon … 7=Sun） |
| period | SMALLINT | NOT NULL（1〜10など） |
| classroom | VARCHAR(120) | NOT NULL, DEFAULT ''（講義室） |

重要制約：
- `UNIQUE(offering_id, day, period)`

---

## 5) user_reviews（評価）

前提：
- **検索はしない**
- `status` は **pending/approved**。削除は status ではなく物理削除

| カラム | 型 | 制約/補足 |
|---|---|---|
| user_review_id | BIGSERIAL | PK |
| user_id | BIGINT | NOT NULL, FK → users(user_id), ON DELETE CASCADE |
| offering_id | BIGINT | NOT NULL, FK → offerings(offering_id), ON DELETE CASCADE |
| comment | TEXT | NOT NULL |
| type | TEXT | NOT NULL（pros/cons/others） |
| status | review_status_enum | NOT NULL, DEFAULT 'pending'（pending/approved） |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()（推奨） |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()（推奨） |

---

## 6) users（ユーザー）

| カラム | 型 | 制約/補足 |
|---|---|---|
| user_id | BIGSERIAL | PK |
| display_name | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

### role について

- 目的：アプリケーション内の権限制御（管理者と一般ユーザーの区別）
- カラム：`role` `varchar(20)`、`NOT NULL`、デフォルト `'user'`
- 例：`'user'`, `'admin'`。アプリ側では文字列比較か列挙でチェックします。

## 追加

| カラム | 型 | 制約/補足 |
|---|---|---|
| user_id
| offer_id 

---

## 7) timetables（作成タイムテーブル）

一人一つのタイムテーブルしか作成できない

| カラム | 型 | 制約/補足 |
|---|---|---|
| timetable_id | BIGSERIAL | PK |
| user_id | BIGINT | NOT NULL, FK → users(user_id), ON DELETE CASCADE |
| title | TEXT | NOT NULL |
| year | SMALLINT | NOT NULL（2000〜2100など） |
| term | term_enum | NOT NULL |
| is_public | BOOLEAN | NOT NULL, DEFAULT FALSE |　← 微妙か？
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

---

## 8) timetable_items（タイムテーブルアイテム）

方針：
- `offering_id` をキーに登録（表示時に `meetings` を参照してコマに展開します）
- あなたの案に合わせ、`day_of_week` / `period` は **NULL可**で残します（不要なら後で削除可能です）

| カラム | 型 | 制約/補足 |
|---|---|---|
| timetable_id | BIGINT | NOT NULL, FK → timetables(timetable_id), ON DELETE CASCADE |
| offering_id | BIGINT | NOT NULL, FK → offerings(offering_id), ON DELETE CASCADE |
| day_of_week | SMALLINT | NULL可（1〜7） |
| period | SMALLINT | NULL可（1〜10など） |
| is_selected | BOOLEAN | NOT NULL, DEFAULT TRUE（履修の選択をしたか） |　← これもいらないか？
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |

重要制約：
- `PRIMARY KEY (timetable_id, offering_id)`（同じ時間割に同じ開講を重複登録させない）

---

## 9) timetable_import_batches / timetable_import_rows（管理画面：時間割CSVインポート）

**用途**：管理画面から時間割CSV（①一般教養科目の時間割CSV／②集中講義のCSV）をアップロードした際の
下書きを保持します。`internal/csvtimetable` がCSVから行を自動抽出し（対応範囲は現状「総合教養科目」の
み。UTF-8/Shift-JISいずれの文字コードにも対応）、admin が編集用リンク（`sheet_url`。Google Sheets
未設定時はアプリ内蔵の編集画面）で内容を確認・修正した上で「公開」すると、その時点の行が該当カテゴリ・
年度・学期の `subjects` / `offerings` / `meetings` に（既存分を置き換える形で）反映されます。実装は
`internal/repository/timetable_import.go` を参照。

### timetable_import_batches

| カラム | 型 | 制約/補足 |
|---|---|---|
| import_batch_id | BIGSERIAL | PK |
| category_slug | VARCHAR(60) | NOT NULL（現状 `general-education` のみ対応） |
| academic_year | SMALLINT | NOT NULL |
| term | VARCHAR(20) | NOT NULL |
| source_filename | TEXT | NOT NULL, DEFAULT ''（アップロードされたCSVのファイル名） |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'draft'（draft / published） |
| sheet_url | TEXT | NOT NULL, DEFAULT ''（編集用リンク） |
| created_by_user_id | BIGINT | NULL可 |
| created_at / updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| published_at | TIMESTAMPTZ | NULL可 |

### timetable_import_rows

| カラム | 型 | 制約/補足 |
|---|---|---|
| import_row_id | BIGSERIAL | PK |
| import_batch_id | BIGINT | NOT NULL, FK → timetable_import_batches(import_batch_id), ON DELETE CASCADE |
| day | SMALLINT | NULL可（1〜7。時間割外/集中講義は NULL） |
| period | SMALLINT | NULL可（1〜10。day と同様） |
| course_code / course_name / instructor / classroom / note | TEXT系 | NOT NULL, DEFAULT '' |
| sort_order | INT | NOT NULL, DEFAULT 0（編集画面での表示順） |

---

# PostgreSQL DDL（そのまま貼れる版）

```sql
-- enum（不要なら TEXT + CHECK に置き換えでもOKです）
DO $$ BEGIN
  CREATE TYPE term_enum AS ENUM ('spring', 'fall');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE modality_enum AS ENUM ('onsite', 'online', 'hybrid', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status_enum AS ENUM ('pending', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) categories
CREATE TABLE IF NOT EXISTS categories (
  category_id  BIGSERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  sort_order   INT NOT NULL DEFAULT 0
);

-- 2) subjects
CREATE TABLE IF NOT EXISTS subjects (
  subject_id   BIGSERIAL PRIMARY KEY,
  category_id  BIGINT NOT NULL REFERENCES categories(category_id),
  title        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, title)
);

-- 3) offerings
CREATE TABLE IF NOT EXISTS offerings (
  offering_id       BIGSERIAL PRIMARY KEY,
  subject_id        BIGINT NOT NULL REFERENCES subjects(subject_id),
  academic_year     SMALLINT NOT NULL CHECK (academic_year BETWEEN 2000 AND 2100),
  term              term_enum NOT NULL,
  modality          modality_enum NOT NULL DEFAULT 'unknown',
  instructor_names  TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subject_id, academic_year, term)
);

-- 4) meetings
CREATE TABLE IF NOT EXISTS meetings (
  meeting_id   BIGSERIAL PRIMARY KEY,
  offering_id  BIGINT NOT NULL REFERENCES offerings(offering_id) ON DELETE CASCADE,
  day          SMALLINT NOT NULL CHECK (day BETWEEN 1 AND 7),
  period       SMALLINT NOT NULL CHECK (period BETWEEN 1 AND 10),
  location     TEXT,
  note         TEXT,
  UNIQUE (offering_id, day, period)
);

-- 6) users（reviewsが参照するので先に作ります）
CREATE TABLE IF NOT EXISTS users (
  user_id      BIGSERIAL PRIMARY KEY,
  display_name TEXT NOT NULL,
  role         varchar(20) NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id    BIGSERIAL PRIMARY KEY,
  offering_id  BIGINT NOT NULL REFERENCES offerings(offering_id) ON DELETE CASCADE,
  user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  md_url       TEXT NOT NULL,
  status       review_status_enum NOT NULL DEFAULT 'public',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) timetables
CREATE TABLE IF NOT EXISTS timetables (
  timetable_id BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  year         SMALLINT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  term         term_enum NOT NULL,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8) timetable_items
CREATE TABLE IF NOT EXISTS timetable_items (
  timetable_id BIGINT NOT NULL REFERENCES timetables(timetable_id) ON DELETE CASCADE,
  offering_id  BIGINT NOT NULL REFERENCES offerings(offering_id) ON DELETE CASCADE,
  day_of_week  SMALLINT CHECK (day_of_week BETWEEN 1 AND 7),
  period       SMALLINT CHECK (period BETWEEN 1 AND 10),
  is_selected  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (timetable_id, offering_id)
);

-- 推奨インデックス（最低限）
CREATE INDEX IF NOT EXISTS idx_subjects_category ON subjects(category_id);
CREATE INDEX IF NOT EXISTS idx_offerings_subject_year_term ON offerings(subject_id, academic_year, term);
CREATE INDEX IF NOT EXISTS idx_meetings_offering ON meetings(offering_id);
CREATE INDEX IF NOT EXISTS idx_reviews_offering_created ON reviews(offering_id, created_at);
CREATE INDEX IF NOT EXISTS idx_timetable_items_timetable ON timetable_items(timetable_id);
```

## マイグレーション注意事項（role カラムの追加）

- 既存のデータベースに `role` カラムを追加するには、アプリケーションのマイグレーションで `ALTER TABLE` を実行します。今回のコードベースでは `internal/migration/migration.go` の `RunMigrations` 内で以下のような idempotent な SQL を実行しています：

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT 'user';
```

- このコマンドは既に `role` カラムが存在する場合は何もしないため、何度実行しても安全です。
- ローカルでマイグレーションを反映する方法：

```bash
docker compose up --build
```

またはプロジェクトに用意されたマイグレート用バイナリを直接実行する場合は：

```bash
# 例: go run ./cmd/migrate  # プロジェクトの実行方法に合わせてください
```

- シードに初期管理者を追加したい場合は、`internal/seed/seed.go` を編集して特定ユーザーの `Role` を `'admin'` に設定してください。
