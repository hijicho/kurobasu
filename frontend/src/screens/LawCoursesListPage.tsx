import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface LawCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function LawCoursesListPage({ isAuthenticated = false, onCourseClick }: LawCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 法学部の科目データ
  const courses = [
    { id: 'law-intro-naka-moriya-kanazawa', name: '法学入門', instructor: '仲 / 守矢 / 金澤' },
    { id: 'criminal-law-part1-tokunaga', name: '刑法第一部（総論）', instructor: '徳永' },
    { id: 'foreign-language-chinese-wang', name: '外国語演習(中国語)', instructor: '王' },
    { id: 'criminal-procedure-matsukura', name: '刑事訴訟法', instructor: '松倉' },
    { id: 'civil-law-part3-fujii', name: '民法第3部', instructor: '藤井' },
    { id: 'international-organization-law-kiriyama', name: '国際組織法', instructor: '桐山' },
    { id: 'political-process-shinada', name: '政治過程論', instructor: '品田' },
    { id: 'intellectual-property-law-akamatsu', name: '知的財産法', instructor: '赤松' },
    { id: 'constitutional-law2-kitamura', name: '憲法2', instructor: '北村' },
    { id: 'criminal-policy-kanazawa', name: '刑事政策', instructor: '金澤' },
    { id: 'international-politics-nagai', name: '国際政治', instructor: '永井' },
    { id: 'commercial-law-part1-kitamura', name: '商法第1部（総則・商行為）', instructor: '北村' },
    { id: 'commercial-law-general-kitamura', name: '商法総則', instructor: '北村' },
    { id: 'comparative-politics-hieda', name: '比較政治学', instructor: '稗田' },
    { id: 'japanese-modern-legal-history-ono', name: '日本近代法制史', instructor: '小野' },
    { id: 'political-science-nagami', name: '政治学', instructor: '永見' },
    { id: 'administrative-law2-sato', name: '行政法2', instructor: '佐藤' },
    { id: 'legal-development-sugimoto', name: '法曹発展科目', instructor: '杉本' },
    { id: 'quantitative-analysis-nishi', name: '法学政治学計量分析', instructor: '西' },
    { id: 'law-of-obligations-fujii', name: '債権総論', instructor: '藤井' },
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
          { label: '法学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">法学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索欄（法学部専用機能） */}
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
