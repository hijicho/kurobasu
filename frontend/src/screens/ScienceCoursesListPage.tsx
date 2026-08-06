import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface ScienceCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function ScienceCoursesListPage({ isAuthenticated = false, onCourseClick }: ScienceCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 理学部の科目データ
  const courses = [
    { id: 'modern-physics-intro-omnibus', name: '現代物理学への招待', instructor: 'オムニバス' },
    { id: 'topology1-practice-hashimoto', name: '位相数学1演習', instructor: '橋本' },
    { id: 'organic-chemistry1-kozaki', name: '有機化学1', instructor: '小嵜' },
    { id: 'math-essentials-a-tamaru', name: '数学要論A', instructor: '田丸' },
    { id: 'information-mathematics-akiyoshi', name: '情報数学', instructor: '秋吉' },
    { id: 'basic-organic-chemistry-fujioka', name: '基礎有機化学', instructor: '藤岡' },
    { id: 'analysis1-ishi', name: '解析学1', instructor: '伊師' },
    { id: 'basic-physical-chemistry-kinoshita', name: '基礎物理化学', instructor: '木下' },
    { id: 'chemical-reaction-theory1-hosokawa', name: '化学反応論1', instructor: '細川' },
    { id: 'topology1-hashimoto', name: '位相数学1', instructor: '橋本' },
    { id: 'animal-physiology1-goto', name: '動物生理学1', instructor: '後藤' },
    { id: 'plant-physiology1-wakabayashi', name: '植物生理学1', instructor: '若林' },
    { id: 'cell-biochemistry1-ihara-kasamatsu', name: '細胞生物化学1', instructor: '居原 / 笠松' },
    { id: 'basic-organic-chemistry-tsuburaya', name: '基礎有機化学', instructor: '円谷' },
    { id: 'analysis1-practice-ishi', name: '解析学1演習', instructor: '伊師' },
    { id: 'basic-electromagnetics-tsunesada', name: '基礎電磁気学', instructor: '常定' },
    { id: 'physics-practice1-kosuge-kubota-yamaguchi-obara', name: '物理学演習1', instructor: '小菅 / 久保田 / 山口 / 小原' },
    { id: 'inorganic-chemistry1-nakajima', name: '無機化学1', instructor: '中島' },
    { id: 'biology-trends-suzuki', name: '生物学の潮流', instructor: '鈴木' },
    { id: 'ordinary-differential-equations-tanigawa', name: '常微分方程式', instructor: '谷川' },
    { id: 'biochemistry1-nakase', name: '生化学1', instructor: '中瀬' },
    { id: 'quantum-chemistry1-sato', name: '量子化学1', instructor: '佐藤' },
    { id: 'linear-algebra-kanda', name: '線形代数', instructor: '神田' },
    { id: 'math-basic-practice1-osumi', name: '数学基礎演習1', instructor: '尾角' },
    { id: 'algebra1-kanda-hashimoto', name: '代数学1', instructor: '神田 / 橋本' },
    { id: 'algebra1-practice-kanda-hashimoto', name: '代数学1演習', instructor: '神田 / 橋本' },
    { id: 'biomolecule-functional-chemistry-moritsugu', name: '生体分子機能化学', instructor: '森次' },
    { id: 'biological-systematics2-atsui-koguchi', name: '生物体系学2', instructor: '厚井 / 小口' },
    { id: 'cell-biochemistry-ihara', name: '細胞生物化学', instructor: '居原' },
    { id: 'molecular-biology-sato', name: '分子生物学', instructor: '佐藤' },
    { id: 'cell-biology3-terakita', name: '細胞生物学3', instructor: '寺北' },
    { id: 'calculus1a-takahashi', name: '微積分1A', instructor: '高橋' },
    { id: 'molecular-biology1-sato', name: '分子生物学1', instructor: '佐藤' },
    { id: 'metabolic-biochemistry-mori', name: '代謝生物化学', instructor: '森' },
    { id: 'differential-geometry1-ishida', name: '微分幾何学1', instructor: '石田' },
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
          { label: '理学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">理学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索欄（理学部専用機能） */}
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
