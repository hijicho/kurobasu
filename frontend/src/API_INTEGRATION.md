# API Integration

フロントエンドは `NEXT_PUBLIC_API_BASE_URL` のバックエンド API を直接呼びます。API に接続できない場合はエラーや空状態を表示し、モックデータへ自動フォールバックしません。

## Base URL

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';
```

本番 Vercel では Cloud Run の `/api/v1` URL を `NEXT_PUBLIC_API_BASE_URL` に設定します。

## Connected Screens

- `TopPage.tsx`: `GET /categories` で登録済みカテゴリを表示
- `TopPage.tsx`: URL の `/:year/:term` を使って `GET /ads?academic_year=...&term=...` で公開広告を表示
- `CategoryPage.tsx`: URL の `/:year/:term/courses/:category` を使って `GET /categories/{slug}/offerings?academic_year=...&term=...`
- `ApiCourseDetailPage.tsx`: `GET /offerings/{id}` と `GET /offerings/{id}/reviews`
- `ReviewSections.tsx`: `POST /reviews`
- `/`: `GET /meta/site-settings` で公開デフォルト年度・学期を取得し、`/:year/:term` に移動
- `admin/*`: 管理ユーザー、口コミ承認/削除、広告アップロード/削除、公開設定の更新

## Auth

認証が必要な API は Supabase Auth の access token を `Authorization: Bearer <token>` で送ります。口コミ投稿は未ログインでも可能で、ログイン済みの場合だけユーザーに紐づきます。

## Known Gaps

- 公開ページは `/:year/:term`、`/:year/:term/courses/{category_slug}`、`/:year/:term/courses/{category_slug}/{offering_id}` で年度・学期を URL に含めます。
- 講義詳細 API は授業名、教員名、年度、学期、授業形態、時間割、レビューを返しますが、評価基準、テスト持ち込み、講義室、授業コード、単位数はまだ返しません。
- 時間割管理ページから CSV（時間割／集中講義）をアップロードすると自動解析され、確認・修正のうえ公開できます。
