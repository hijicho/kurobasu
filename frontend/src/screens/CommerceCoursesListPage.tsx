import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface CommerceCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function CommerceCoursesListPage({ isAuthenticated = false, onCourseClick }: CommerceCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 商学部の科目データ
  const courses = [
    { id: 'accounting-basics-asano', name: '会計基礎論', instructor: '浅野' },
    { id: 'marketing-management-kobayashi', name: 'マーケティング管理論', instructor: '小林' },
    { id: 'business-management-matsuo', name: '経営管理論', instructor: '松尾' },
    { id: 'municipal-finance-mizukami', name: '自治体財政論', instructor: '水上' },
    { id: 'urban-transport-kang', name: '都市交通論', instructor: '姜' },
    { id: 'international-management-ishii', name: '国際経営論', instructor: '石井' },
    { id: 'business-admin-nakase', name: '経営学', instructor: '中瀬' },
    { id: 'regional-economics-matsunaga', name: '地域経済論', instructor: '松永' },
    { id: 'sme-theory-honda', name: '中小企業論', instructor: '本多' },
    { id: 'real-estate-intro-kitano', name: '不動産概論', instructor: '北野' },
    { id: 'business-admin-intro-uenoyama', name: '経営学概論', instructor: '上野山' },
    { id: 'management-practice1-kobayashi', name: 'マネジメント実践1', instructor: '小林' },
    { id: 'regional-industry-sekine', name: '地域産業論', instructor: '関根' },
    { id: 'industrial-history-maki', name: '産業史', instructor: '牧' },
    { id: 'business-statistics-takada', name: '経営統計論', instructor: '高田' },
    { id: 'financial-accounting-intro-ishikawa', name: '財務会計概論', instructor: '石川' },
    { id: 'environmental-theory-yokemoto', name: '環境論', instructor: '除本' },
    { id: 'foreign-reading-commerce-maki', name: '外書購読(商学)', instructor: '牧' },
    { id: 'financial-institutions-kitano', name: '金融機関論', instructor: '北野' },
    { id: 'international-accounting-ogata', name: '国際会計論', instructor: '小形' },
    { id: 'public-management-intro-omnibus', name: '公共経営序論', instructor: 'オムニバス' },
    { id: 'international-location-suzuki', name: '国際立地論', instructor: '鈴木' },
    { id: 'foreign-reading-management-ishii', name: '外書講読(経営)', instructor: '石井' },
    { id: 'hrm-theory-ichimura', name: '人的資源管理論', instructor: '市村' },
    { id: 'regional-revitalization-fujitsuka', name: '地域再生論', instructor: '藤塚' },
    { id: 'cultural-policy-yoshida', name: '文化政策論', instructor: '吉田' },
    { id: 'corporate-finance-chen', name: '経営財務論', instructor: '陳' },
    { id: 'business-english-yumiba', name: 'ビジネス英語', instructor: '弓場' },
    { id: 'business-history-nakase', name: '経営史', instructor: '中瀬' },
    { id: 'cost-accounting-boku', name: '原価計算論', instructor: '卜' },
    { id: 'advanced-bookkeeping-okajima', name: '上級簿記', instructor: '岡島' },
    { id: 'business-topics-nakaya', name: 'ビジネス・トピックス', instructor: '中矢' },
    { id: 'corporate-strategy-nakamoto', name: '企業戦略論', instructor: '中本' },
    { id: 'foreign-reading-management-hayashi', name: '外書購読 経営', instructor: '林' },
    { id: 'foreign-reading-accounting-ishikawa', name: '外書購読(会計)', instructor: '石川' },
    { id: 'social-accounting-mukoyama', name: '社会関連会計論', instructor: '向山' },
    { id: 'business-model-ozeki', name: 'ビジネスモデル論', instructor: '小関' },
    { id: 'international-capital-markets-wang', name: '国際資本市場', instructor: '王' },
    { id: 'business-communication-watkins', name: 'ビジネスコミュニケーション', instructor: 'Watkins' },
    { id: 'international-capital-market-wang', name: '国際資本市場論', instructor: '王' },
    { id: 'industrial-cluster-tatsumi', name: '産業集積論', instructor: '立見' },
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
          { label: '商学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">商学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索欄（商学部専用機能） */}
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