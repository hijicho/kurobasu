import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface NursingCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function NursingCoursesListPage({ isAuthenticated = false, onCourseClick }: NursingCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 看護学部の科目データ
  const courses = [
    { id: 'anatomy-physiology-sawai', name: '解剖生理学', instructor: '澤井' },
  ];

  // 検索フィルタリング
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(query) ||
      course.instructor.toLowerCase().includes(query)
    );
  });

  const handleCourseClick = (courseId: string) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '看護学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">看護学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索欄（看護学部専用機能） */}
        <div className="mb-6 md:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="授業名・担当教員で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] focus:border-transparent"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs md:text-sm text-gray-500 text-center">
                {filteredCourses.length}件の科目が見つかりました
              </p>
            )}
          </div>
        </div>

        {/* 科目一覧カード（PC3列・スマホ2列レイアウト） */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleCourseClick(course.id)}
              className="bg-white border border-gray-200 rounded-2xl p-3 md:p-4 hover:border-[#2B4DCA] hover:shadow-md transition-all text-left"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-sm md:text-base text-[#2B4DCA] hover:underline line-clamp-2">
                  {course.name}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">担当：{course.instructor}</p>
              </div>
            </button>
          ))}
        </div>

        {/* 検索結果が0件の場合 */}
        {filteredCourses.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">「{searchQuery}」に一致する科目が見つかりませんでした</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[#2B4DCA] hover:underline text-sm md:text-base"
            >
              検索をクリア
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
