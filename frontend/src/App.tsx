import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { TopPage } from "./pages/TopPage";
import { CategoryPage } from "./pages/CategoryPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { MyPage } from "./pages/MyPage";
import { TimetableExamplesPage } from "./pages/TimetableExamplesPage";

type Page = "login" | "top" | "category" | "course-detail" | "mypage" | "timetable-examples";
type Category = "general" | "second-language" | "foundation" | "first-year-seminar" | "health-sports" | "english" | "specialized";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("top");
  const [currentCategory, setCurrentCategory] = useState<Category>("general");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const categoryNames: Record<Category, string> = {
    "general": "般教（一般教育科目）",
    "second-language": "第二外国語",
    "foundation": "基礎教育科目",
    "first-year-seminar": "初年次ゼミナール",
    "health-sports": "健康・スポーツ科学",
    "english": "英語",
    "specialized": "専門科目",
  };

  // ページ切り替え用のナビゲーション（デモ用）
  const renderNavigation = () => {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-white border-2 border-theme-primary rounded-2xl shadow-2xl p-4">
        <div className="text-sm mb-2">デモナビゲーション</div>
        <div className="flex flex-col gap-2 text-sm">
          <button
            onClick={() => setCurrentPage("top")}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "top" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            トップ
          </button>
          <button
            onClick={() => setCurrentPage("mypage")}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "mypage" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            マイページ
          </button>
          <button
            onClick={() => setCurrentPage("login")}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "login" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            ログイン
          </button>
          <button
            onClick={() => {
              setCurrentCategory("general");
              setCurrentPage("category");
            }}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "category" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            カテゴリページ
          </button>
          <button
            onClick={() => setCurrentPage("course-detail")}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "course-detail" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            授業詳細
          </button>
          <button
            onClick={() => setCurrentPage("timetable-examples")}
            className={`px-3 py-2 rounded-lg text-left ${currentPage === "timetable-examples" ? "bg-theme-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            時間割の例
          </button>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setIsAuthenticated(!isAuthenticated)}
              className="px-3 py-2 rounded-lg bg-green-100 hover:bg-green-200 w-full text-left"
            >
              {isAuthenticated ? "ログアウト" : "ログイン状態にする"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setCurrentPage("mypage");
            }}
          />
        );
      case "top":
        return <TopPage onNavigateToMyPage={() => setCurrentPage("mypage")} isAuthenticated={isAuthenticated} />;
      case "mypage":
        return <MyPage onNavigateToLogin={() => setCurrentPage("login")} isAuthenticated={isAuthenticated} />;
      case "category":
        return (
          <CategoryPage 
            categoryName={categoryNames[currentCategory]}
            categoryId={currentCategory}
            onNavigateBack={() => setCurrentPage("top")}
            onCourseClick={(courseId) => setCurrentPage("course-detail")}
          />
        );
      case "course-detail":
        return <CourseDetailPage isAuthenticated={isAuthenticated} />;
      case "timetable-examples":
        return <TimetableExamplesPage onNavigateBack={() => setCurrentPage("top")} />;
      default:
        return <TopPage onNavigateToMyPage={() => setCurrentPage("mypage")} isAuthenticated={isAuthenticated} />;
    }
  };

  return (
    <>
      {renderPage()}
      {renderNavigation()}
    </>
  );
}