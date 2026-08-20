import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TimetableView } from '../components/TimetableView';
import { Breadcrumb } from '../components/Breadcrumb';
import { getOfferings, Offering } from '../lib/api';
import { publicTopPath, termLabels } from '../lib/public-routing';
import { OfferingRatingStars } from '../components/OfferingRatingStars';

interface CategoryPageProps {
  categoryName: string;
  categoryId: string;
  academicYear: number;
  term: string;
  onNavigateBack?: () => void;
  onCourseClick?: (courseId: string) => void;
}

export function CategoryPage({
  categoryName,
  categoryId,
  academicYear,
  term,
  onNavigateBack,
  onCourseClick,
}: CategoryPageProps) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const usesTimetable = categoryId === 'general-education';

  // 授業データをAPIから取得
  useEffect(() => {
    let cancelled = false;

    const fetchOfferings = async () => {
      try {
        setLoading(true);
        const response = await getOfferings(categoryId, academicYear, term);
        if (!cancelled) {
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
  }, [academicYear, categoryId, term]);

  // APIデータを時間割ビュー用のフォーマットに変換
  const convertToTimetableSlots = (offerings: Offering[]) => {
    const slots: any[] = [];
    
    offerings.forEach((offering) => {
      offering.meetings.forEach((meeting) => {
        // 集中講義・時間割外（day/period が null）は週間グリッドに置けないのでスキップ
        const { day, period } = meeting;
        if (day == null || period == null) {
          return;
        }
        // 既存のslotを探す
        let slot = slots.find(
          (s) => s.period === period && s.day === day - 1 // APIのdayは1始まり、UIは0始まり
        );

        if (!slot) {
          slot = {
            period: period,
            day: day - 1,
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
          ratingAverage: offering.rating_average,
          ratingCount: offering.rating_count,
          ratingRank: offering.rating_rank,
          reviewCount: offering.review_count,
        });
      });
    });

    return slots;
  };

  const timetableSlots = usesTimetable ? convertToTimetableSlots(offerings) : [];
  // 曜日・時限が定まらない授業（集中講義・時間割外）は時間割表に載らないため別枠で一覧表示する
  const intensiveOfferings = usesTimetable
    ? offerings.filter((offering) => !offering.meetings.some((m) => m.day != null))
    : [];

  // 科目名・担当者名で絞り込み（カテゴリごとに取得したofferingsの範囲内で検索）
  const matchesSearch = (offering: Offering) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      offering.subject.title.toLowerCase().includes(query) ||
      offering.instructor_names.join('、').toLowerCase().includes(query)
    );
  };

  // 外国語科目（英語必修・日本語教師/英語教師）向けの表示調整：
  // 口コミがある授業を先頭に、口コミが新しい順で並べる／カードは科目名より担当教員を目立たせる
  const isEnglishRequiredCategory = categoryId === 'english-japanese' || categoryId === 'english-native';
  // 基礎教育科目も同じ「幅の狭いカード」表示にし、口コミが多い授業を先頭に並べる
  const isFoundationList = categoryId === 'foundation-list';
  const usesNarrowCards = isEnglishRequiredCategory || isFoundationList;
  // 外国語科目・基礎教育科目はおすすめ度を表示しない（口コミ件数は表示する）
  const hidesRating = usesNarrowCards;
  const byLatestReview = (a: Offering, b: Offering) => {
    const aTime = a.latest_review_at ? new Date(a.latest_review_at).getTime() : 0;
    const bTime = b.latest_review_at ? new Date(b.latest_review_at).getTime() : 0;
    return bTime - aTime;
  };
  // 口コミ件数が多い順（同数なら口コミが新しい順）
  const byReviewCount = (a: Offering, b: Offering) => {
    if (b.review_count !== a.review_count) return b.review_count - a.review_count;
    return byLatestReview(a, b);
  };

  const filteredOfferings = useMemo(() => {
    const items = offerings.filter(matchesSearch);
    if (isEnglishRequiredCategory) return [...items].sort(byLatestReview);
    if (isFoundationList) return [...items].sort(byReviewCount);
    return items;
  }, [offerings, searchQuery, isEnglishRequiredCategory, isFoundationList]);

  // 外国語科目は同じ担当教員が複数クラス（曜日・時限違い）を持つのが普通で、
  // データとしては別々の正当な授業。ただし一覧表示は教員名しか出さないため
  // 同じ名前が何度も並んで見えてしまう。データは消さず、表示だけ1教員1行に
  // まとめる（口コミが多い方のクラスを代表として残す）。
  const displayedOfferings = useMemo(() => {
    if (!isEnglishRequiredCategory) return filteredOfferings;
    const byInstructor = new Map<string, Offering>();
    for (const offering of filteredOfferings) {
      const key = offering.instructor_names.join('、') || `__no_instructor_${offering.offering_id}`;
      const existing = byInstructor.get(key);
      if (!existing || offering.review_count > existing.review_count) {
        byInstructor.set(key, offering);
      }
    }
    return Array.from(byInstructor.values());
  }, [filteredOfferings, isEnglishRequiredCategory]);

  const filteredIntensiveOfferings = useMemo(
    () => intensiveOfferings.filter(matchesSearch),
    [intensiveOfferings, searchQuery]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: publicTopPath(academicYear, term) },
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
            <h1 className="mb-2 text-2xl sm:text-4xl">{categoryName}</h1>
            <p className="text-gray-600 text-sm">
              {academicYear}年度 {termLabels[term] ?? term}。授業を選択すると詳細が表示されます
            </p>
          </div>
        </div>

        {/* 検索 */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="科目名や担当者名で検索"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#2B4DCA] focus:ring-2 focus:ring-[#2B4DCA]/20"
            />
          </div>
        </div>

        {/* おすすめ度 */}
        {usesTimetable && (
          <div className="border border-[#2B4DCA] rounded-xl p-4 mb-6 bg-[#ffffff]">
            <h3 className="text-sm mb-2">おすすめ度</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(252, 156, 90, 0.05)', borderColor: '#fc9c5a', borderWidth: '1px', color: '#fc9c5a' }}>AA</span>
                <span className="text-gray-700">4〜5点</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(248, 37, 1, 0.05)', borderColor: '#f82501', borderWidth: '1px', color: '#f82501' }}>A</span>
                <span className="text-gray-700">2〜4点</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(39, 172, 73, 0.05)', borderColor: '#27ac49', borderWidth: '1px', color: '#27ac49' }}>B</span>
                <span className="text-gray-700">1〜2点</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(34, 176, 236, 0.05)', borderColor: '#22b0ec', borderWidth: '1px', color: '#22b0ec' }}>C</span>
                <span className="text-gray-700">0〜1点</span>
              </div>
            </div>
          </div>
        )}

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
        ) : usesTimetable ? (
          <>
            <TimetableView
              slots={timetableSlots}
              onCourseClick={onCourseClick}
            />

            {intensiveOfferings.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">集中講義・時間割外</h2>
                {filteredIntensiveOfferings.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
                    該当する授業が見つかりませんでした。
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredIntensiveOfferings.map((offering) => {
                      return (
                        <button
                          key={offering.offering_id}
                          onClick={() => onCourseClick?.(String(offering.offering_id))}
                          className="relative flex h-20 flex-col justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-2 text-left transition-all hover:border-[#2B4DCA] hover:shadow-md"
                        >
                          <h3 className="line-clamp-2 text-sm font-bold text-[#2B4DCA]">{offering.subject.title}</h3>
                          <p className="line-clamp-1 text-xs text-gray-500">{offering.instructor_names.join('、')}</p>
                          <OfferingRatingStars
                            rating={offering.rating_average}
                            count={offering.rating_count}
                            rank={offering.rating_rank}
                            reviewCount={offering.review_count}
                            className="mt-1"
                          />
                          {offering.note && (
                            <p className="line-clamp-1 text-[11px] text-gray-500">{offering.note}</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : filteredOfferings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
            該当する授業が見つかりませんでした。
          </div>
        ) : usesNarrowCards ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {displayedOfferings.map((offering) => (
              <button
                key={offering.offering_id}
                onClick={() => onCourseClick?.(String(offering.offering_id))}
                className="flex items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-[#2B4DCA] hover:shadow-md"
              >
                <span className="flex flex-col overflow-hidden">
                  {isEnglishRequiredCategory ? (
                    <span className="line-clamp-1 text-base font-bold text-[#2B4DCA]">
                      {offering.instructor_names.join('、') || '担当教員未設定'}
                    </span>
                  ) : (
                    <>
                      <span className="line-clamp-1 text-base font-bold text-[#2B4DCA]">{offering.subject.title}</span>
                      <span className="line-clamp-1 text-xs text-gray-500">
                        {offering.instructor_names.join('、') || '担当教員未設定'}
                      </span>
                    </>
                  )}
                  {offering.review_count > 0 && (
                    <span className="text-xs text-gray-500">口コミ{offering.review_count}件</span>
                  )}
                </span>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300" />
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredOfferings.map((offering) => {
              return (
                <button
                  key={offering.offering_id}
                  onClick={() => onCourseClick?.(String(offering.offering_id))}
                  className="relative flex h-24 flex-col justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2.5 text-left transition-all hover:border-[#2B4DCA] hover:shadow-md"
                >
                  <h3 className="line-clamp-2 text-base font-bold text-[#2B4DCA]">{offering.subject.title}</h3>
                  <p className="line-clamp-1 text-xs text-gray-500">
                    {offering.instructor_names.join('、') || '担当教員未設定'}
                  </p>
                  <OfferingRatingStars
                    rating={offering.rating_average}
                    count={offering.rating_count}
                    rank={offering.rating_rank}
                    reviewCount={offering.review_count}
                    showWhenUnrated={false}
                    hideRating={hidesRating}
                    className="mt-1.5"
                  />
                  {offering.note && (
                    <p className="line-clamp-1 text-xs text-gray-500">{offering.note}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
