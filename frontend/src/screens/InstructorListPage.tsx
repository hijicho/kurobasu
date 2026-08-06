import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface InstructorListPageProps {
  isAuthenticated?: boolean;
  onInstructorClick?: (instructorId: string) => void;
}

export function InstructorListPage({ isAuthenticated = false, onInstructorClick }: InstructorListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 教員データ（フラットリスト化）
  const instructors = [
    { id: 'hayashi-yuki', name: '林 祐樹' },
    { id: 'masuda-seiko', name: '桝田聖子' },
    { id: 'fujita-akito', name: '藤田昭人' },
    { id: 'noguchi-norimasa', name: '野口 典正' },
    { id: 'tode-hideki', name: '戸出英樹、北條仁志' },
    { id: 'nagata-yoshikatsu', name: '永田 好克' },
    { id: 'fujimoto-manato', name: '藤本まなと' },
    { id: 'iwata-motoi', name: '岩田基' },
    { id: 'masuyama-naoki', name: '増山直輝、能島裕介' },
    { id: 'kitani-yuki', name: '木谷裕紀' },
    { id: 'nishimura-yuichiro', name: '西村雄一郎' },
    { id: 'yoshida-daisuke', name: '吉田 大介' },
    { id: 'tran-thi-hong', name: 'TRAN THI HONG' },
    { id: 'onishi-katsumi', name: '大西 克実' },
  ];

  // 検索でフィルタリング
  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstructorClick = (instructorId: string) => {
    if (onInstructorClick) {
      onInstructorClick(instructorId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-6">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '情報リテラシー科目 教員一覧' },
        ]} />

        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl mb-2">2026年度前期　情報リテラシー科目</h1>
          <p className="text-sm md:text-base text-gray-600">教員名をクリックすると、詳細ページに移動します。</p>
        </div>

        {/* 検索欄 */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="教員名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* 教員一覧カード（PC3列・スマホ2列） */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {filteredInstructors.map((instructor) => (
            <button
              key={instructor.id}
              onClick={() => handleInstructorClick(instructor.id)}
              className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 hover:border-[#2B4DCA] hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base text-[#2B4DCA] hover:underline truncate">
                    {instructor.name}
                  </h3>
                </div>
                <div className="text-gray-400 mt-0.5 flex-shrink-0">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 検索結果なし */}
        {filteredInstructors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">該当する教員が見つかりませんでした</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}