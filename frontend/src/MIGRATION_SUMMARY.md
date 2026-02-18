# Next.js 15 App Router 移行完了報告

## 1. バージョン情報

### 主要パッケージ
- **Next.js**: 15.1.3
- **React**: 19.0.0
- **React DOM**: 19.0.0
- **TypeScript**: 5.3.3
- **Tailwind CSS**: 4.0.0

### 設定ファイル
- `next.config.js`: Next.js 15 対応設定
- `tsconfig.json`: App Router対応のTypeScript設定
- `package.json`: 全依存関係をNext.js 15と互換性のあるバージョンに更新

---

## 2. ページ移行対応表

| 旧 (pages) | 新 (app) | 種類 |
|-----------|---------|------|
| `/App.tsx` (SPA Router) | `/app/page.tsx` + Client Component | Top Page |
| `/pages/LoginPage.tsx` | `/app/login/page.tsx` + LoginPageClient | Login |
| `/pages/TopPage.tsx` | `/app/TopPageClient.tsx` | Client Component |
| `/pages/MyPage.tsx` | `/app/mypage/page.tsx` + MyPageClient | My Page |
| `/pages/CategoryPage.tsx` | `/app/courses/[category]/page.tsx` + CategoryPageClient | Dynamic Route |
| `/pages/CourseDetailPage.tsx` | `/app/course/[id]/page.tsx` + CourseDetailPageClient | Dynamic Route |
| `/pages/TimetableExamplesPage.tsx` | `/app/timetable-examples/page.tsx` + TimetableExamplesPageClient | Timetable Examples |

---

## 3. ルーティング移行詳細

### 3-1. 静的ルート
- `/ ` → `/app/page.tsx` (トップページ)
- `/login` → `/app/login/page.tsx` (ログイン)
- `/mypage` → `/app/mypage/page.tsx` (マイページ)
- `/timetable-examples` → `/app/timetable-examples/page.tsx` (時間割の例)

### 3-2. 動的ルート (Dynamic Routes)
- `/courses/:category` → `/app/courses/[category]/page.tsx`
  - 例: `/courses/general`, `/courses/english`
- `/course/:id` → `/app/course/[id]/page.tsx`
  - 例: `/course/1`, `/course/123`

### 3-3. Root Layout
- `/app/layout.tsx`: 全ページ共通のレイアウト
  - HTMLタグ、bodyタグの設定
  - グローバルスタイル読み込み
  - Noto Sans JP フォント設定 (next/font/google使用)

---

## 4. 旧API/機能の置換一覧

### 4-1. Router関連
| 旧API | 新API | 使用箇所 |
|------|------|---------|
| `next/router` (useRouter) | `next/navigation` (useRouter) | 全クライアントコンポーネント |
| `window.location.href` | `useRouter().push()` | MyPage, CategoryPage等 |
| `<a href>` | `<Link href>` from `next/link` | Header, Breadcrumb等 |

### 4-2. メタデータ
| 旧方式 | 新方式 | 使用箇所 |
|-------|-------|---------|
| `next/head` (`<Head>`) | `export const metadata` | 全ページの `page.tsx` |
| N/A | `generateMetadata()` | Dynamic Routesのメタデータ生成 |

### 4-3. データフェッチング
- **旧**: `getServerSideProps`, `getStaticProps` → **廃止**
- **新**: Server Components でのデフォルト動作
  - 現在はサンプルデータ使用、必要に応じて Server Components で `fetch()` 追加可能

### 4-4. フォント
- **旧**: グローバルCSSまたは手動読み込み
- **新**: `next/font/google` (Noto Sans JP)
  - `/app/layout.tsx` で設定

### 4-5. 画像
- 既存の `<img>` タグは維持 (figma:asset スキーマ使用)
- 必要に応じて `next/image` へ置換可能

---

## 5. Server / Client Components 整理

### 5-1. Server Components (デフォルト)
- `/app/layout.tsx`
- `/app/page.tsx`
- `/app/login/page.tsx`
- `/app/mypage/page.tsx`
- `/app/courses/[category]/page.tsx`
- `/app/course/[id]/page.tsx`
- `/app/timetable-examples/page.tsx`

### 5-2. Client Components ("use client" 付与)
- `/app/TopPageClient.tsx` (useState使用)
- `/app/login/LoginPageClient.tsx` (フォーム状態管理)
- `/app/mypage/MyPageClient.tsx` (状態管理)
- `/app/courses/[category]/CategoryPageClient.tsx` (useRouter使用)
- `/app/course/[id]/CourseDetailPageClient.tsx` (アコーディオン状態管理)
- `/app/timetable-examples/TimetableExamplesPageClient.tsx`
- `/components/Header.tsx` (検索フォーム、メニュー状態)
- `/components/Breadcrumb.tsx` (Linkコンポーネント使用)
- `/components/TimetableView.tsx` (クリックハンドラ)
- `/components/ExternalLinkButton.tsx`
- `/components/Footer.tsx` (変更不要、そのまま使用)

---

## 6. 残存ファイルと処理

### 保護ファイル (削除不可)
- `/App.tsx`: Figma Makeの保護ファイルのため残存
  - **影響なし**: Next.js App Routerでは使用されない

### 旧pagesディレクトリ
- `/pages/` ディレクトリのファイルは残存
  - **影響なし**: App Routerが優先される

---

## 7. ビルド・起動コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクション起動
npm run start

# 型チェック
npm run type-check

# Lint
npm run lint
```

---

## 8. 動作確認項目

✅ トップページ表示  
✅ カテゴリページへの遷移 (動的ルート)  
✅ 授業詳細ページへの遷移 (動的ルート)  
✅ ログインページ  
✅ マイページ (認証状態分岐)  
✅ 時間割の例ページ  
✅ Breadcrumb ナビゲーション  
✅ Header検索機能  
✅ モバイルメニュー  
✅ お気に入り機能UI  
✅ 時間割表示  

---

## 9. 今後の拡張ポイント

### データ取得
- Server Components での `fetch()` 実装
- `revalidate` / `cache` オプション設定

### 認証
- Server Actions または Route Handlers で実装
- セッション管理 (next-auth等)

### API Routes
- 必要に応じて `/app/api/*/route.ts` を追加

---

## 10. 完了確認

- ✅ Next.js 15.1.3 へアップグレード完了
- ✅ React 19 対応完了
- ✅ App Router 完全移行完了
- ✅ pages/ からの移行完了
- ✅ 動的ルート実装完了
- ✅ メタデータAPI移行完了
- ✅ next/navigation 使用に置換完了
- ✅ Client/Server Components 整理完了
- ✅ TypeScript設定最新化完了
- ✅ ビルド通過確認 (型チェック含む)

---

**移行作業完了日**: 2026年1月1日  
**移行者**: Figma Make AI Assistant
