import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TimetableView } from '../components/TimetableView';
import { Breadcrumb } from '../components/Breadcrumb';
import { getOfferings, Offering, USE_MOCK_DATA } from '../lib/api';

interface CategoryPageProps {
  categoryName: string;
  categoryId: string;
  onNavigateBack?: () => void;
  onCourseClick?: (courseId: string) => void;
}

export function CategoryPage({ categoryName, categoryId, onNavigateBack, onCourseClick }: CategoryPageProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYear] = useState(2026);
  const [term] = useState('spring');

  // 般教用のモックデータ
  const generalMockOfferings: Offering[] = [
    {
      offering_id: 501,
      subject: { 
        subject_id: 9001, 
        title: '線形代数',
        course_code: '1GBB001101',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['山田 太郎', '公大　花子'],
      rate: 'AA',
      meetings: [
        { day: 1, period: 2 },
        { day: 5, period: 2 }
      ]
    },
    {
      offering_id: 502,
      subject: { 
        subject_id: 9002, 
        title: '微分積分学',
        course_code: '1GBB001102',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['佐藤 次郎'],
      rate: 'A',
      meetings: [
        { day: 3, period: 1 }
      ]
    },
    {
      offering_id: 503,
      subject: { 
        subject_id: 9003, 
        title: '情報リテラシー',
        course_code: '1GBB001103',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'remote',
      instructor_names: ['田中 三郎'],
      rate: 'B',
      meetings: [
        { day: 4, period: 3 }
      ]
    },
  ];

  // 初年次教育科目（初ゼミ）用のモックデータ
  const firstYearSeminarMockOfferings: Offering[] = [
    {
      offering_id: 601,
      subject: { 
        subject_id: 8001, 
        title: '人工知能を知り、考える',
        course_code: '1GBA001003',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['増山 直輝'],
      rate: 'AA',
      meetings: [
        { day: 2, period: 2 }
      ]
    },
    {
      offering_id: 602,
      subject: { 
        subject_id: 8002, 
        title: 'GISを使って地域のことを考えよう',
        course_code: '1GBA001004',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['根本 達也'],
      rate: 'A',
      meetings: [
        { day: 2, period: 5 }
      ]
    },
    {
      offering_id: 603,
      subject: { 
        subject_id: 8003, 
        title: '日本近現代史の諸問題について',
        course_code: '1GBA001005',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['住友 陽文'],
      rate: 'A',
      meetings: [
        { day: 2, period: 1 }
      ]
    },
    {
      offering_id: 604,
      subject: { 
        subject_id: 8004, 
        title: '判例を読むー法学や刑事事件が好きな人へー',
        course_code: '1GBA001007',
        credits: 2.0
      },
      academic_year: 2026,
      term: '前期',
      modality: 'onsite',
      instructor_names: ['松倉 治代'],
      rate: 'B',
      meetings: [
        { day: 2, period: 1 }
      ]
    },
  ];

  // カテゴリに応じてモックデータを選択
  const mockOfferings = categoryId === 'first-year-seminar' 
    ? firstYearSeminarMockOfferings 
    : generalMockOfferings;

  // 授業データをAPIから取得
  useEffect(() => {
    const fetchOfferings = async () => {
      // モックデータモードの場合はAPI呼び出しをスキップ
      if (USE_MOCK_DATA) {
        setOfferings(mockOfferings);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getOfferings(categoryId, academicYear, term);
        setOfferings(response.items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch offerings:', err);
        console.warn('バックエンドAPIに接続できません。モックデータを使用します。');
        
        // モックデータを使用（API接続失敗時のフォールバック）
        setOfferings(mockOfferings);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, [categoryId, academicYear, term]);

  // APIデータを時間割ビュー用のフォーマットに変換
  const convertToTimetableSlots = (offerings: Offering[]) => {
    const slots: any[] = [];
    
    offerings.forEach((offering) => {
      offering.meetings.forEach((meeting) => {
        // 既存のslotを探す
        let slot = slots.find(
          (s) => s.period === meeting.period && s.day === meeting.day - 1 // APIのdayは1始まり、UIは0始まり
        );

        if (!slot) {
          slot = {
            period: meeting.period,
            day: meeting.day - 1,
            courses: [],
          };
          slots.push(slot);
        }

        // コースを追加
        slot.courses.push({
          id: String(offering.offering_id),
          courseCode: offering.subject.course_code,
          name: offering.subject.title,
          instructor: offering.instructor_names.join('、'),
          credits: offering.subject.credits,
          format: offering.modality === 'onsite' ? '対面' : offering.modality === 'remote' ? '遠隔' : 'ハイブリッド',
          level: offering.rate as 'AA' | 'A' | 'B' | 'C' | 'D' | 'F',
        });
      });
    });

    return slots;
  };

  const timetableSlots = convertToTimetableSlots(offerings);

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
          slots={timetableSlots} 
          onCourseClick={onCourseClick}
        />
      </main>

      <Footer />
    </div>
  );
}