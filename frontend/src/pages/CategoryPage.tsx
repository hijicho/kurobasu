import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TimetableView } from '../components/TimetableView';
import { Breadcrumb } from '../components/Breadcrumb';

interface CategoryPageProps {
  categoryName: string;
  categoryId: string;
  onNavigateBack?: () => void;
  onCourseClick?: (courseId: string) => void;
}

export function CategoryPage({ categoryName, categoryId, onNavigateBack, onCourseClick }: CategoryPageProps) {
  // サンプルデータ（実際は各カテゴリに応じたデータを渡す）
  const sampleSlots = [
    {
      period: 1,
      day: 0, // 月曜
      courses: [
        {
          id: '1',
          name: 'マクロ経済学入門',
          instructor: '山田太郎',
          format: '対面',
          level: 'AA' as const,
        },
      ],
    },
    {
      period: 1,
      day: 2, // 水曜
      courses: [
        {
          id: '2',
          name: '心理学概論',
          instructor: '佐藤花子',
          format: '遠隔',
          level: 'A' as const,
        },
      ],
    },
    {
      period: 2,
      day: 1, // 火曜
      courses: [
        {
          id: '3',
          name: '社会学入門',
          instructor: '鈴木次郎',
          format: '対面',
          level: 'B' as const,
        },
        {
          id: '4',
          name: '哲学基礎',
          instructor: '田中三郎',
          format: '遠隔',
          level: 'A' as const,
        },
      ],
    },
    {
      period: 3,
      day: 3, // 木曜
      courses: [
        {
          id: '5',
          name: '文化人類学',
          instructor: '伊藤美咲',
          format: '対面',
          level: 'C' as const,
        },
      ],
    },
    {
      period: 4,
      day: 4, // 金曜
      courses: [
        {
          id: '6',
          name: '現代社会論',
          instructor: '高橋健一',
          format: '対面',
          level: 'AA' as const,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: categoryName },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-2">{categoryName}</h1>
            <p className="text-gray-600 text-sm">授業を選択すると詳細が表示されます</p>
          </div>
        </div>

        {/* 凡例 */}
        <div className="border border-[#2B4DCA] rounded-xl p-4 mb-6 bg-[#ffffff]">
          <h3 className="text-sm mb-2">Lv（難易度・推奨度）</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(252, 156, 90, 0.05)', borderColor: '#fc9c5a', borderWidth: '1px', color: '#fc9c5a' }}>AA</span>
              <span className="text-gray-700">楽単！！</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(248, 37, 1, 0.05)', borderColor: '#f82501', borderWidth: '1px', color: '#f82501' }}>A</span>
              <span className="text-gray-700">普通</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(39, 172, 73, 0.05)', borderColor: '#27ac49', borderWidth: '1px', color: '#27ac49' }}>B</span>
              <span className="text-gray-700">興味があれば</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(34, 176, 236, 0.05)', borderColor: '#22b0ec', borderWidth: '1px', color: '#22b0ec' }}>C</span>
              <span className="text-gray-700">よほど興味があれば</span>
            </div>
          </div>
        </div>

        {/* 時間割表 */}
        <TimetableView 
          slots={sampleSlots} 
          onCourseClick={onCourseClick}
        />
      </main>

      <Footer />
    </div>
  );
}