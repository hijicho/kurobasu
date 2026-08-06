# 画面別に使うAPI（limit/cursorなし・termあり）

前提：
- 画面遷移：**トップ（カテゴリ+年度） → 授業一覧（カテゴリ×年度×term） → 授業詳細（=評価一覧）**
- 授業一覧は **曜日・時限（meetings）込み**で返す
- ページング（limit/cursor）は **使わない**
- 開発環境は、localhost:8000を使用
- Base URL: `/api/v1`

---

## 画面1：トップ（カテゴリ選択 + 年度選択）

### 叩くAPI
- **GET** `/api/v1/categories`

返す例：
```json
{
  "items": [
    { "category_id": 1, "slug": "general", "name": "般教" },
    { "category_id": 2, "slug": "engineering", "name": "工学部" }
  ]
}
```

（任意）デフォルト年度をサーバで決めたい場合
- **GET** `/api/v1/meta/default-academic-year`

返す例：
```json
{ "academic_year": 2026 前期}　
```

---

## 画面2：授業一覧（カテゴリ×年度×term）

目的：選択した **カテゴリ + 年度 + term（前期/後期など）** の授業（= offerings）を、曜日・時限・**評価**込みで一覧表示する。

### 叩くAPI（メイン）
- **GET** `/api/v1/categories/{slug}/offerings?academic_year=2026&term=spring`

返す例（1 offering に meetings 配列）：
```json
{
  "items": [
    {
      "offering_id": 501,
      "subject": { "subject_id": 9001, "title": "線形代数" },
      "academic_year": 2026,
      "term": "前期",
      "modality": "onsite",
      "instructor_names": ["山田 太郎", "公大　花子"],
      "rate" : "AA",
      "meetings": [
        { "day": 1, "period": 2 },
        { "day": 4, "period": 2 }
      ]
    }
  ]
}
```

表示順（おすすめ）：
- API側で `day → period → subject.title` の順でソートして返す  
  （フロントでソートでもOK）

---

## 画面3：授業詳細（= 評価一覧） **保留**

目的：選んだ授業（offering）に紐づくレビュー（評価）一覧を表示する。

### 叩くAPI
- **GET** `/api/v1/offerings/{offering_id}/reviews`

返す例：
```json
{
  "items": [
    {
      "review_id": 3001,
      "md_url": "https://example.com/reviews/3001.md", 要検討
      "status": "public",
      "author": { "user_id": 42, "display_name": "Alice" },
      "created_at": "2026-02-18T12:34:56Z"
    }
  ]
}
```

（任意）評価一覧画面に「授業名・曜日時限」も出したい場合：
- **案A（2回叩く）**
  - GET `/api/v1/offerings/{offering_id}`
  - GET `/api/v1/offerings/{offering_id}/reviews`
- **案B（1回で済ませる）**
  - GET `/api/v1/offerings/{offering_id}/reviews` のレスポンスに `offering_summary` を含める

---

## 最小セットまとめ
- トップ：`GET /categories`
- 授業一覧：`GET /categories/{slug}/offerings?academic_year=...&term=...`（meetings込み）
- 授業詳細（評価一覧）：`GET /offerings/{id}/reviews`


# 追加：ユーザー登録（Firebase Authentication 方針）

このプロジェクトでは、**登録/ログインは Firebase Authentication**（フロント側）で行い、API/DB側は **Firebase IDトークンの検証**と**自前DBユーザー（profiles）の作成**のみを担当します。

## 認証ヘッダー
ログインが必要なAPIでは、以下のヘッダーを付与します。

- `Authorization: Bearer <firebase_id_token>`

> ※IDトークンはサーバ側で Firebase Admin SDK により検証します。

---

## 画面：初回セットアップ（ユーザー登録完了後のプロファイル作成）

Firebaseでユーザー作成（またはログイン）した直後に、**1回だけ**（ただし冪等なので何度叩いてもOK）APIを叩いてDB側ユーザーを作ります。

### 叩くAPI
- **POST** `/api/v1/auth/bootstrap`

Headers:
- `Authorization: Bearer <firebase_id_token>`

Request（最小）:
```json
{
  "display_name": "Alice"
}
```

Response（作成でも既存でも同じ形式）:
```json
{
  "user_id": 42,
  "firebase_uid": "firebase_uid_here",
  "display_name": "Alice",
  "created_at": "2026-02-18T00:00:00Z"
}
```

---

## 画面：ログイン確認（アプリ起動時 / マイページ用）

### 叩くAPI
- **GET** `/api/v1/me`

Headers:
- `Authorization: Bearer <firebase_id_token>`

Response:
```json
{
  "user_id": 42,
  "display_name": "Alice",
  "created_at": "2026-02-18T00:00:00Z"
}
```

運用案：
- DBにユーザーが無い（bootstrap未実行）場合は `404` を返し、フロントが `/auth/bootstrap` を呼ぶように誘導する

---

## （任意）画面：表示名変更

### 叩くAPI
- **PATCH** `/api/v1/me`

Headers:
- `Authorization: Bearer <firebase_id_token>`

Request:
```json
{ "display_name": "NewName" }
```

---

## 補足（今後ログイン必須になるAPI）
現状この資料に出ている **閲覧系（カテゴリ/授業一覧/評価一覧）** はログイン不要でOKです。  
ただし、以下のような「ユーザーに紐づく操作」を作る場合は、上記の認証ヘッダーが必要になります。

- レビュー投稿/編集/削除（例：`POST /reviews` など）
- 時間割作成/編集/公開設定（例：`POST /timetables` など）
