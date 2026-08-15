import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TimetableView } from '../components/TimetableView';
import { Breadcrumb } from '../components/Breadcrumb';
import { getDefaultAcademicYear, getOfferings, Offering } from '../lib/api';

interface CategoryPageProps {
  categoryName: string;
  categoryId: string;
  onNavigateBack?: () => void;
  onCourseClick?: (courseId: string) => void;
}

const levelBadgeClasses: Record<string, string> = {
  AA: 'bg-orange-100 text-orange-700',
  A: 'bg-red-100 text-red-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-blue-100 text-blue-700',
};

export function CategoryPage({ categoryName, categoryId, onNavigateBack, onCourseClick }: CategoryPageProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState(2026);
  const [term] = useState('spring');

  // 授業データをAPIから取得
  useEffect(() => {
    let cancelled = false;

    const fetchOfferings = async () => {
      try {
        setLoading(true);
        const meta = await getDefaultAcademicYear().catch(() => ({ academic_year: academicYear }));
        const response = await getOfferings(categoryId, meta.academic_year, term);
        if (!cancelled) {
          setAcademicYear(meta.academic_year);
          setOfferings(response.items);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch offerings:', err);
        if (!cancelled) {
          setOfferings([]);
          setError('授業データを取得できませんでした。カテゴリ slug または API の状態を確認してください。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOfferings();
    return () => {
      cancelled = true;
    };
  }, [categoryId, term]);

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
          courseCode: offering.course_code,
          name: offering.subject.title,
          instructor: offering.instructor_names.join('、'),
          credits: offering.subject.credits,
          level: offering.rate as 'AA' | 'A' | 'B' | 'C' | 'D' | 'F',
        });
      });
    });

    return slots;
  };

  const timetableSlots = convertToTimetableSlots(offerings);
  // 曜日・時限が定まらない授業（集中講義・時間割外）は時間割表に載らないため別枠で一覧表示する
  const intensiveOfferings = offerings.filter((offering) => offering.meetings.length === 0);

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
            <p className="text-gray-600 text-sm">{academicYear}年度 前期。授業を選択すると詳細が表示されます</p>
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
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
            授業データを読み込んでいます。
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : offerings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
            このカテゴリの授業データはまだ登録されていません。
          </div>
        ) : (
          <>
            <TimetableView
              slots={timetableSlots}
              onCourseClick={onCourseClick}
            />

            {intensiveOfferings.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">集中講義・時間割外</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {intensiveOfferings.map((offering) => {
                    const level = offering.rate;
                    return (
                      <button
                        key={offering.offering_id}
                        onClick={() => onCourseClick?.(String(offering.offering_id))}
                        className="relative rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-[#2B4DCA] hover:shadow-md"
                      >
                        {level && levelBadgeClasses[level] && (
                          <span className={`absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${levelBadgeClasses[level]}`}>
                            {level}
                          </span>
                        )}
                        <h3 className="mb-1 pr-8 text-sm font-bold text-gray-900">{offering.subject.title}</h3>
                        <p className="text-xs font-semibold text-gray-600">{offering.instructor_names.join('、')}</p>
                        {offering.note && (
                          <p className="mt-1 text-[11px] font-medium leading-snug text-gray-500">{offering.note}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
