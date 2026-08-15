'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, Monitor, Users } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ReviewSections } from '@/components/course-detail/ReviewSections';
import { getOffering, type Offering } from '@/lib/api';

interface ApiCourseDetailPageProps {
  offeringId: number;
  categoryName: string;
  onNavigateToList?: () => void;
}

const dayLabels = ['月', '火', '水', '木', '金', '土', '日'];

function modalityLabel(modality: string) {
  switch (modality) {
    case 'onsite':
      return '対面';
    case 'online':
    case 'remote':
      return '遠隔';
    case 'hybrid':
      return 'ハイブリッド';
    default:
      return '未定';
  }
}

function termLabel(term: string) {
  switch (term) {
    case 'spring':
      return '前期';
    case 'fall':
      return '後期';
    case 'intensive':
      return '集中';
    case 'year':
      return '通年';
    default:
      return term;
  }
}

export function ApiCourseDetailPage({ offeringId, categoryName, onNavigateToList }: ApiCourseDetailPageProps) {
  const [offering, setOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOffering() {
      try {
        setLoading(true);
        const response = await getOffering(offeringId);
        if (!cancelled) {
          setOffering(response);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch offering:', err);
        if (!cancelled) {
          setError('授業情報を取得できませんでした。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOffering();
    return () => {
      cancelled = true;
    };
  }, [offeringId]);

  const meetingText = useMemo(() => {
    if (!offering || offering.meetings.length === 0) {
      return '時間割未定';
    }
    return offering.meetings
      .map((meeting) => {
        const base = `${dayLabels[meeting.day - 1] ?? meeting.day}曜 ${meeting.period}限`;
        return meeting.classroom ? `${base}（${meeting.classroom}）` : base;
      })
      .join(' / ');
  }, [offering]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb
          items={[
            { label: 'トップ', href: '/' },
            { label: categoryName, onClick: onNavigateToList },
            { label: offering?.subject.title ?? '授業詳細' },
          ]}
        />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => (onNavigateToList ? onNavigateToList() : window.history.back())}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
            aria-label="戻る"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-2">{offering?.subject.title ?? '授業詳細'}</h1>
            <p className="text-gray-600 text-sm">
              {loading ? '読み込み中です' : error ?? offering?.instructor_names.join('、')}
            </p>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">{error}</div>
        ) : offering ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="mb-4">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">担当教員</p>
                    <p className="font-medium">{offering.instructor_names.join('、') || '未定'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">曜日・時限</p>
                    <p className="font-medium">{meetingText}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">年度・学期</p>
                    <p className="font-medium">
                      {offering.academic_year}年度 {termLabel(offering.term)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">授業形態</p>
                    <p className="font-medium">{modalityLabel(offering.modality)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <ReviewSections pros={[]} cons={[]} others={[]} offeringId={offering.offering_id} />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
            授業情報を読み込んでいます。
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
