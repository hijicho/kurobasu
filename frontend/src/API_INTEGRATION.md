# API連携実装ガイド

## 概要
apidesign.mdに基づいて、バックエンドAPIとの連携を実装しました。
**バックエンドサーバーが起動していない場合でも、モックデータで動作します。**

## 実装内容

### 1. API クライアント (`/lib/api.ts`)
全てのAPI呼び出しを一元管理するクライアントを作成しました。

#### 主な機能
- エラーハンドリング付きの fetch ラッパー
- 型安全なAPI関数
- Bearer認証トークンのサポート

#### Base URL
```
開発環境: http://localhost:8000/api/v1
```

### 2. 実装済みAPI

#### カテゴリAPI
- **GET /categories** - カテゴリ一覧取得
  - 使用箇所: `TopPage.tsx`
  - 状態管理: `useState` + `useEffect`

#### 授業API
- **GET /categories/{slug}/offerings** - カテゴリ別授業一覧取得
  - 使用箇所: `CategoryPage.tsx`
  - パラメータ: `academic_year`, `term`
  - データ変換: API形式 → UI時間割形式

#### レビューAPI（保留）
- **GET /offerings/{offering_id}/reviews** - 授業のレビュー一覧取得
  - 使用箇所: `CourseDetailPage.tsx`
  - 状態: 実装済みだが、まだUIに反映していない

#### 認証API
- **POST /auth/bootstrap** - ユーザープロフィール作成
- **GET /me** - ログインユーザー情報取得
- **PATCH /me** - ユーザー情報更新
  - 使用箇所: `MyPage.tsx`（モック実装）
  - 注意: Firebase Authenticationとの連携が必要

### 3. データ変換

#### CategoryPage での変換
APIから取得した`Offering`データを時間割ビュー用のスロットに変換：

```typescript
offerings.forEach((offering) => {
  offering.meetings.forEach((meeting) => {
    // APIのdayは1始まり、UIは0始まり
    const uiDay = meeting.day - 1;
    
    // スロットに授業を追加
    slot.courses.push({
      id: String(offering.offering_id),
      name: offering.subject.title,
      instructor: offering.instructor_names.join('、'),
      format: offering.modality === 'onsite' ? '対面' : '遠隔',
      level: offering.rate,
    });
  });
});
```

### 4. エラーハンドリング

各ページで以下のパターンを実装：

**重要：モックデータフォールバック**
バックエンドAPIに接続できない場合、自動的にモックデータを使用して動作を継続します。
開発中にバックエンドサーバーが起動していなくても、フロントエンドの開発・テストが可能です。

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAPI();
      setData(response.items);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch:', err);
      console.warn('バックエンドAPIに接続できません。モックデータを使用します。');
      
      // API接続失敗時はモックデータを使用
      setData([/* モックデータ */]);
      setError(null); // エラーは非表示（モックで動作継続）
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

**実装済みモックデータ：**
- TopPage: カテゴリ一覧（7件）
- CategoryPage: 授業一覧（3件のサンプル授業）
- CourseDetailPage: レビュー一覧（2件のサンプルレビュー）

## CORS設定

バックエンド側で以下の設定が必要です：

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 今後の実装予定

### 1. Firebase Authentication連携
現在、認証APIはモック実装です。実際のFirebase連携には以下が必要：

```typescript
// Firebase初期化
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// IDトークン取得
const auth = getAuth();
const user = auth.currentUser;
const idToken = await user?.getIdToken();

// API呼び出し
const profile = await getMe(idToken);
```

### 2. レビュー表示機能
CourseDetailPageでレビューデータを実際に表示する。

### 3. ローディング状態のUI改善
現在はローディング中でもデータが空の状態で表示されます。スピナーやスケルトンUIの追加を検討。

### 4. 環境変数による設定
開発環境と本番環境でBase URLを切り替え：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

## テスト方法

### 1. バックエンドサーバーを起動
```bash
# バックエンドディレクトリで
python manage.py runserver 8000
```

### 2. フロントエンド起動
```bash
# このプロジェクトで
npm run dev
```

### 3. 動作確認
- トップページでカテゴリ一覧が表示されるか
- カテゴリページで授業一覧が時間割形式で表示されるか
- 授業詳細ページでレビューが取得されるか（コンソール確認）

## トラブルシューティング

### CORSエラーが出る場合
バックエンドのCORS設定を確認してください。

### ネットワークエラーが出る場合
- バックエンドサーバーが起動しているか確認
- Base URLが正しいか確認（`/lib/api.ts`）

### データが表示されない場合
- ブラウザの開発者ツールでネットワークタブを確認
- APIレスポンスの形式がapidesign.mdと一致しているか確認