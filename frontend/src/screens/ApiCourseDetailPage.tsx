'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, MapPin, Monitor, Users } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ReviewSections } from '@/components/course-detail/ReviewSections';
import { OfferingRatingStars } from '@/components/OfferingRatingStars';
import { RatingRenewalNotice } from '@/components/RatingRenewalNotice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { createOfferingRating, deleteOfferingRating, getApiErrorMessage, getOffering, type Offering } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface ApiCourseDetailPageProps {
  offeringId: number;
  categoryName: string;
  usesTimetable?: boolean;
  topHref?: string;
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
    default:
      return term;
  }
}

export function ApiCourseDetailPage({
  offeringId,
  categoryName,
  usesTimetable = true,
  topHref = '/',
  onNavigateToList,
}: ApiCourseDetailPageProps) {
  const { getIdToken } = useAuth();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [hasOwnRating, setHasOwnRating] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOffering() {
      try {
        setLoading(true);
        const response = await getOffering(offeringId);
        if (!cancelled) {
          setOffering(response);
          setError(null);
          if (response.your_rating !== undefined) {
            setSelectedScore(response.your_rating);
            setHasOwnRating(true);
          }
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
    if (!offering) {
      return '時間割未定';
    }
    // 集中講義・時間割外は day/period が null（講義室だけ持つ）
    const scheduled = offering.meetings.filter(
      (meeting): meeting is typeof meeting & { day: number; period: number } =>
        meeting.day != null && meeting.period != null
    );
    if (scheduled.length === 0) {
      return '日程未定';
    }
    return scheduled.map((meeting) => `${dayLabels[meeting.day - 1] ?? meeting.day}曜 ${meeting.period}限`).join(' / ');
  }, [offering]);

  const classroomText = useMemo(() => {
    if (!offering || offering.meetings.length === 0) {
      return '未定';
    }
    const classrooms = offering.meetings.map((meeting) => meeting.classroom).filter((c): c is string => !!c);
    if (classrooms.length === 0) {
      return '未定';
    }
    return Array.from(new Set(classrooms)).join(' / ');
  }, [offering]);

  // 星をクリックした時点ではまだ選択のみ（送信は「反映する」ボタンから確認の上で行う）
  const handlePickScore = (score: number) => {
    setSelectedScore(score);
    setRatingMessage(null);
  };

  const handleConfirmRate = async () => {
    if (!offering || selectedScore === null) return;
    setSavingRating(true);
    setRatingMessage(null);
    try {
      const idToken = await getIdToken();
      const rating = await createOfferingRating(offering.offering_id, selectedScore, idToken);
      setOffering({
        ...offering,
        rating_average: rating.rating_average,
        rating_count: rating.rating_count,
        rating_rank: rating.rating_rank,
      });
      setHasOwnRating(true);
      setRatingMessage('おすすめ度を保存しました。');
    } catch (err) {
      setRatingMessage(getApiErrorMessage(err, 'おすすめ度の保存に失敗しました。'));
    } finally {
      setSavingRating(false);
    }
  };

  const handleConfirmDeleteRating = async () => {
    if (!offering) return;
    setSavingRating(true);
    setRatingMessage(null);
    try {
      const idToken = await getIdToken();
      const rating = await deleteOfferingRating(offering.offering_id, idToken);
      setOffering({
        ...offering,
        rating_average: rating.rating_average,
        rating_count: rating.rating_count,
        rating_rank: rating.rating_rank,
      });
      setHasOwnRating(false);
      setSelectedScore(null);
      setRatingMessage('あなたのおすすめ度を削除しました。');
    } catch (err) {
      setRatingMessage(getApiErrorMessage(err, 'おすすめ度の削除に失敗しました。'));
    } finally {
      setSavingRating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header homeHref={topHref} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb
          items={[
            { label: 'トップ', href: topHref },
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
            <h1 className="mb-2 flex flex-wrap items-center gap-3 text-2xl sm:text-4xl">
              {offering?.subject.title ?? '授業詳細'}
            </h1>
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
              <h2 className="mb-4 text-base md:text-lg">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">担当教員</p>
                    <p className="font-medium">{offering.instructor_names.join('、') || '未定'}</p>
                  </div>
                </div>
                {usesTimetable && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">曜日・時限</p>
                      <p className="font-medium">{meetingText}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">年度・学期</p>
                    <p className="font-medium">
                      {offering.academic_year}年度 {termLabel(offering.term)}
                    </p>
                  </div>
                </div>
                {usesTimetable && (
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">授業形態</p>
                      <p className="font-medium">{modalityLabel(offering.modality)}</p>
                    </div>
                  </div>
                )}
                {usesTimetable && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">実施キャンパス・講義室</p>
                      <p className="font-medium">{classroomText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base md:text-lg">おすすめ度</h2>
                    <RatingRenewalNotice />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">1〜5 の星でこの授業のおすすめ度を投稿できます。</p>
                </div>
                <OfferingRatingStars
                  rating={offering.rating_average}
                  count={offering.rating_count}
                  rank={offering.rating_rank}
                  size="lg"
                />
              </div>
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-sm font-medium text-gray-700">あなたのおすすめ度</p>
                <OfferingRatingStars
                  rating={offering.rating_average}
                  count={offering.rating_count}
                  rank={offering.rating_rank}
                  size="lg"
                  interactive
                  selectedScore={selectedScore}
                  disabled={savingRating}
                  onSelect={handlePickScore}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        disabled={selectedScore === null || savingRating}
                        className="rounded-lg bg-[#2B4DCA] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#243fa8] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingRating ? '送信中…' : '反映する'}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-black">評価を投稿しますか？</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                          皆様の評価の上で成り立っています。くれぐれも正当な評価をお願いいたします。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200 bg-white text-black hover:bg-gray-50">
                          キャンセル
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirmRate}
                          className="bg-[#2B4DCA] text-white hover:bg-[#243fa8]"
                        >
                          投稿する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {hasOwnRating && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={savingRating}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingRating ? '処理中…' : '削除する'}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-black">評価を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            あなたが投稿したこの授業へのおすすめ度を削除します。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-gray-200 bg-white text-black hover:bg-gray-50">
                            キャンセル
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleConfirmDeleteRating}
                            className="bg-red-600 text-white hover:bg-red-700"
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {ratingMessage ? <p className="text-sm text-gray-600">{ratingMessage}</p> : null}
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
