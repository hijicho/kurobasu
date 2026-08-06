import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface JapaneseInstructorListPageProps {
  isAuthenticated?: boolean;
  onInstructorClick?: (instructorId: string) => void;
}

export function JapaneseInstructorListPage({ isAuthenticated = false, onInstructorClick }: JapaneseInstructorListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 日本語教師データ（フラットリスト化）
  const instructors = [
    { id: 'ikari-yukio', name: '井狩幸男' },
    { id: 'inagaki-suchin', name: '稲垣 スーチン' },
    { id: 'taji-toshihiko', name: '田路 敏彦' },
    { id: 'fujii-yoshiko', name: '藤井 佳子' },
    { id: 'yabui-emiko', name: '薮井恵美子' },
    { id: 'takaya-hana', name: '高谷 華' },
    { id: 'kumadaki-yuki', name: '熊懐 祐樹' },
    { id: 'kuragaki-sumiko', name: '倉垣 澄子' },
    { id: 'kawabata-junji', name: '川端 淳司' },
    { id: 'tsutsui-kayoko', name: '筒井 香代子' },
    { id: 'ikehata-chikako', name: '池端 千賀子' },
    { id: 'honma-yuko', name: '本間 祐子' },
    { id: 'iwata-masahiko', name: '岩田 雅彦' },
    { id: 'kikuchi-yuki', name: '菊池 由記' },
    { id: 'takai-kinuko', name: '髙井絹子/千田まや' },
    { id: 'uemura-junko', name: '上村 淳子' },
    { id: 'yoshida-yuri', name: '吉田優里' },
    { id: 'kosaka-miho', name: '小阪 美帆' },
    { id: 'fujioka-mayumi', name: '藤岡 真由美' },
    { id: 'hanasaki-tomoko', name: '花崎 知子' },
    { id: 'hamamoto-hideki', name: '濱本 秀樹' },
    { id: 'takahashi-minako', name: '高橋 美奈子' },
    { id: 'yamaguchi-norikazu', name: '山口 徳一' },
    { id: 'sato-makiko', name: '佐藤 牧子' },
    { id: 'lee-hyunsook', name: '李 鉉淑' },
    { id: 'yamazaki-masato', name: '山崎 雅人' },
    { id: 'ishii-takayuki', name: '石井 隆之' },
    { id: 'saito-tomoko', name: '齋藤 倫子' },
    { id: 'noda-miki', name: '野田 三貴' },
    { id: 'toda-yoko', name: '遠田 陽子' },
    { id: 'takahashi-akio', name: '高橋 章夫' },
    { id: 'araki-yasuhiro', name: '荒木 康裕' },
    { id: 'shimizu-kanae', name: '清水 佳苗' },
    { id: 'ogami-yuichiro', name: '大神 雄一郎' },
    { id: 'tsutada-kazumi', name: '蔦田 和美' },
    { id: 'dake-mami', name: '嶽 麻美' },
    { id: 'matsumura-yuko', name: '松村 優子' },
    { id: 'hasegawa-kenichi', name: '長谷川 健一' },
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
          { label: '外国語科目(英語必修)-日本語教師' },
        ]} />

        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl mb-2">外国語科目(英語必修)-日本語教師</h1>
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