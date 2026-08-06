import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface LiteratureCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function LiteratureCoursesListPage({ isAuthenticated = false, onCourseClick }: LiteratureCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 文学部の科目データ
  const courses = [
    { id: 'folklore-ono', name: '民俗学', instructor: '大野' },
    { id: 'comparative-expression-takashima', name: '比較表現論', instructor: '高島' },
    { id: 'asian-coexistence-culture-tawada', name: 'アジア共生文化論', instructor: '多和田' },
    { id: 'sociology-research-methods-kim', name: '社会学研究法', instructor: '金' },
    { id: 'education-history-hirota', name: '教育史', instructor: '弘田' },
    { id: 'sociology-special-d-hirayama', name: '社会学特論D', instructor: '平山' },
    { id: 'human-behavior-data-analysis-1b-moriya', name: '人間行動学データ解析法１b', instructor: '森谷' },
    { id: 'human-culture-intro-b-kusao', name: '人間文化概論B', instructor: '草生' },
    { id: 'education-research-methods-soeda', name: '教育学研究法', instructor: '添田' },
    { id: 'philosophy-history-survey-nakahata', name: '哲学史通論', instructor: '中畑' },
    { id: 'psychology-intro-1-kawabe', name: '心理学概論1', instructor: '川邉' },
    { id: 'human-behavior-data-analysis-1-moriya', name: '人間行動学データ解析法1', instructor: '森谷' },
    { id: 'linguistic-culture-intro-a-omnibus', name: '言語文化概論A', instructor: 'オムニバス / 豊田 / 小林 / LIN / 張 / 高橋 / 大岩本 / 山本 / 田中 / 西田' },
    { id: 'geographic-information-kimura', name: '地理情報学', instructor: '木村' },
    { id: 'linguistic-culture-intro-b-shirata', name: '言語文化概論B', instructor: '白田 / 奥野 / 福島 / 信國 / 丹羽 / 久堀 / 大山 / 髙井 / 長谷川' },
    { id: 'education-seminar-c-shimada', name: '教育学演習C', instructor: '島田' },
    { id: 'japanese-literature-history-c-hayashi', name: '国文学史C', instructor: '林' },
    { id: 'music-culture-resource-seminar-numata', name: '音楽文化資源論演習', instructor: '沼田' },
    { id: 'popular-culture-masuda', name: 'ポピュラー文化論', instructor: '増田' },
    { id: 'japanese-history-basic-reading-1-iwashita', name: '日本史基礎講読1', instructor: '磐下' },
    { id: 'asian-culture-basic-theory-tawada', name: 'アジア文化学基礎論', instructor: '多和田' },
    { id: 'latin-1-sato', name: 'ラテン語1', instructor: '佐藤' },
    { id: 'museum-education-inoue', name: '博物館教育論', instructor: '井上' },
    { id: 'human-culture-basic-theory-1-niki', name: '人間文化基礎論1', instructor: '仁木' },
    { id: 'human-behavior-intro-b-ishida-soda', name: '人間行動学概論B', instructor: '石田 / 祖田' },
    { id: 'sociology-intro-b-kim', name: '社会学概論B', instructor: '金' },
    { id: 'museum-information-media-yoshida', name: '博物館情報・メディア論', instructor: '吉田' },
    { id: 'archaeology-survey-kishimoto', name: '考古学通論', instructor: '岸本' },
    { id: 'human-culture-basic-theory-1b-niki', name: '人間文化基礎論1b', instructor: '仁木' },
    { id: 'psychological-assessment-special-son', name: '心理的アセスメント特論', instructor: '孫' },
    { id: 'western-classical-studies-horikawa', name: '西洋古典学', instructor: '堀川' },
    { id: 'philosophy-intro-1-sakane', name: '哲学概論1', instructor: '佐金' },
    { id: 'education-research-methods-1-soeda', name: '教育学研究法1', instructor: '添田' },
    { id: 'aesthetics-intro-1-takanashi', name: '美学概論I', instructor: '高梨' },
    { id: 'japanese-history-survey-a-niki', name: '日本史通論A', instructor: '仁木' },
    { id: 'neurophysiological-psychology-special-kawabe', name: '神経・生理心理学特論', instructor: '川邉' },
    { id: 'human-culture-basic-theory-1a-sakane', name: '人間文化基礎論1a', instructor: '佐金' },
    { id: 'education-methodology-ii', name: '教育方法学', instructor: '井伊' },
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
          { label: '文学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">文学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索欄（文学部専用機能） */}
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
