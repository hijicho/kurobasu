package router

import (
	"github.com/hageruto/kurobasu/internal/handlers" // HTTPハンドラーの実装
	"github.com/hageruto/kurobasu/internal/middleware"
	"net/http"
)

// =====================
// SetupRoutes: すべてのAPIルートを登録する
// =====================
// 役割を学ぶ：
//   1. HTTP メソッド (GET, POST, PATCH) を構成
//   2. エンドポイント URL パターンを登録
//   3. 該当するハンドラー関数を关連付け
// 戴返り値：*http.ServeMux (ルーターインスタンス)
func SetupRoutes() http.Handler {
	// http.ServeMux: Goの標準 HTTP ルーター
	// URL パターンをハンドラー関数にマップして、リクエストをどのハンドラーが処理するかを決める
	mux := http.NewServeMux()

	// =====================
	// カテゴリ API
	// =====================
	// GET /api/v1/categories
	// 効果：すべてのカテゴリ一覧を取得
	mux.HandleFunc("/api/v1/categories", methodHandler(http.MethodGet, handlers.ListCategories))

	// =====================
	// 開講情報 (Offerings) API
	// =====================
	// GET /api/v1/categories/{slug}/offerings
	// 効果：特定のカテゴリ上のすべての開講情報を一覧取得
	mux.HandleFunc("/api/v1/categories/{slug}/offerings", methodHandler(http.MethodGet, handlers.ListOfferingsByCategory))
	// GET /api/v1/offerings/{id}
	// 効果：特定の開講情報を詳詳情報 (会議、講师など) 付きで一件取得
	mux.HandleFunc("/api/v1/offerings/{id}", methodHandler(http.MethodGet, handlers.GetOffering))
	// GET /api/v1/offerings/{id}/reviews
	// 効果：特定の開講に尊するして国を一覧取得
	mux.HandleFunc("/api/v1/offerings/{id}/reviews", methodHandler(http.MethodGet, handlers.ListReviews))

	// =====================
	// 講義詳詳情報 (Reviews) API
	// =====================
	// POST /api/v1/reviews
	// 効果：新しい講義詳詳を作成。リクエストボディに JSON で詳詳情報を送らなければいけない
	mux.HandleFunc("/api/v1/reviews", middleware.RequireAuth(methodHandler(http.MethodPost, handlers.CreateReview)))
	// GET /api/v1/reviews/{id}
	// (removed) 単一レビュー取得エンドポイントは廃止
	// GET /api/v1/me/reviews
	// 効果：現在ログインしているユーザーが作成したレビュー一覧を取得
	mux.HandleFunc("/api/v1/me/reviews", middleware.RequireAuth(methodHandler(http.MethodGet, handlers.ListMyReviews)))
	// GET /api/v1/me/reviews/{id}
	// 効果：現在ログインしているユーザーが作成した特定レビューを取得
	mux.HandleFunc("/api/v1/me/reviews/{id}", middleware.RequireAuth(methodHandler(http.MethodGet, handlers.GetMyReview)))

	// =====================
	// 認護 (Auth) API
	// =====================
	// POST /api/v1/auth/bootstrap
	// 効果：初回接箏時に新しいユーザーを作成。有効な Firebase ID トークンが必要
	mux.HandleFunc("/api/v1/auth/bootstrap", middleware.RequireFirebaseToken(methodHandler(http.MethodPost, handlers.BootstrapUser)))
	// POST /api/v1/auth/logout
	// 効果：Firebase のリフレッシュトークンを失効させる（サーバー側ログアウト）
	mux.HandleFunc("/api/v1/auth/logout", middleware.RequireAuth(methodHandler(http.MethodPost, handlers.LogoutUser)))
	// meHandler() を使用して同一うる URL で複数の HTTP メソッドを处理
	// GET /api/v1/me
	// 効果：現在ログインしているユーザー情報を取得
	// PATCH /api/v1/me
	// 効果：現在ログインしているユーザー情報を更新
	mux.HandleFunc("/api/v1/me", middleware.RequireAuth(meHandler()))

	// =====================
	// 管理者 (Admin) API
	// =====================
	// GET /api/v1/admin/users
	// 効果：全ユーザー一覧を取得（admin ロールのみ）
	mux.HandleFunc("/api/v1/admin/users", middleware.RequireAuth(middleware.RequireRole("admin")(methodHandler(http.MethodGet, handlers.ListUsers))))
	// PATCH /api/v1/admin/users/{id}/role
	// 効果：ユーザーのロールを変更（admin ロールのみ）
	mux.HandleFunc("/api/v1/admin/users/{id}/role", middleware.RequireAuth(middleware.RequireRole("admin")(methodHandler(http.MethodPatch, handlers.UpdateUserRole))))

	// =====================
	// 時間割 (Timetables) API
	// =====================
	// POST /api/v1/timetables
	// 効果：新しい時間割を作成
	mux.HandleFunc("/api/v1/timetables", methodHandler(http.MethodPost, handlers.CreateTimetable))
	// GET /api/v1/timetables/{id}
	// 効果：特定の時間割を取得 (列残している講義情報付き)
	// PATCH /api/v1/timetables/{id}
	// 効果：時間割を更新
	mux.HandleFunc("/api/v1/timetables/{id}", timetableHandler())

	// =====================
	// メタデータ API
	// =====================
	// GET /api/v1/meta/default-academic-year
	// 効果：現在年度のデフォルト値を取得 (例：2026)
	mux.HandleFunc("/api/v1/meta/default-academic-year", methodHandler(http.MethodGet, handlers.GetDefaultAcademicYear))

	// 作成したルーターを CORS ミドルウェアでラップして返す
	return middleware.CORS(mux)
}

// =====================
// methodHandler: HTTP メソッドを検査し、指定されたメソッドの場合だけハンドラーを実行
// =====================
// 入力：
//   - method: 許积する HTTP メソッド ("GET", "POST" など)
//   - handler: 実行したいハンドラー関数
// 戴返り値： http.HandlerFunc
// 役割：セキュリティの為かのため、正しい HTTP メソッドのリクエストだけは処理を下す
func methodHandler(method string, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != method {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		handler(w, r)
	}
}

// meHandler handles both GET and PATCH requests to /api/v1/me
func meHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetCurrentUser(w, r)
		case http.MethodPatch:
			handlers.UpdateCurrentUser(w, r)
		default:
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}

// =====================
// timetableHandler: /api/v1/timetables/{id} エンドポイント用の複数メソッド対応ハンドラー
// =====================
// GET と PATCH の両メソッドをサポート
func timetableHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// HTTPメソッドに応じて異なるハンドラーを実行
		switch r.Method {
		case http.MethodGet:
			// GET /api/v1/timetables/{id} -> 特定の時間割を詳細情報付きで取得
			handlers.GetTimetable(w, r)
		case http.MethodPatch:
			// PATCH /api/v1/timetables/{id} -> 時間割を更新
			handlers.UpdateTimetable(w, r)
		default:
			// その他のメソッドは 405 Method Not Allowed
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	}
}