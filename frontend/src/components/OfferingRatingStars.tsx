'use client';

import { Star } from 'lucide-react';

export type RatingRank = 'AA' | 'A' | 'B' | 'C';

export const rankClass: Record<RatingRank, string> = {
  AA: 'bg-[#fc9c5a] text-white border-[#fc9c5a]',
  A: 'bg-[#f82501] text-white border-[#f82501]',
  B: 'bg-[#27ac49] text-white border-[#27ac49]',
  C: 'bg-[#22b0ec] text-white border-[#22b0ec]',
};

export function rankForRating(rating?: number): RatingRank | undefined {
  if (rating === undefined) return undefined;
  if (rating >= 4.9) return 'AA';
  if (rating >= 4.4) return 'A';
  if (rating >= 3.0) return 'B';
  return 'C';
}

interface OfferingRatingStarsProps {
  rating?: number;
  count: number;
  rank?: RatingRank;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selectedScore?: number | null;
  disabled?: boolean;
  onSelect?: (score: number) => void;
  className?: string;
  // 口コミ（良かった/悪かった/その他）の件数。指定すると星評価の横に表示する
  reviewCount?: number;
  // false のとき、おすすめ度が未評価なら星・ランク・「未評価」表示ごと出さない
  // （口コミ件数だけあれば口コミ件数は表示する）。既定は true（従来通り常に表示）。
  showWhenUnrated?: boolean;
  // true のとき、評価が付いていても星・ランク・点数を一切表示しない
  // （そのカテゴリではおすすめ度自体を見せたくない場合用。口コミ件数は表示する）。
  hideRating?: boolean;
  // true のとき、星・点数は表示したままランクバッジだけ非表示にする
  // （カード右上などに別途ランクバッジを出す場合、二重表示を避けるために使う）。
  hideRankBadge?: boolean;
  // true のとき、星5つ＋「X.X / 5（N件）」の代わりに、星1つ＋「X.X（N）」だけの
  // 1行表示にする（時間割ビューと同じ簡略表示）。一覧カードが評価の有無で縦に
  // 伸び縮みしすぎるのを防ぐため。interactive のときは無視される。
  compact?: boolean;
}

export function OfferingRatingStars({
  rating,
  count,
  rank,
  size = 'sm',
  interactive = false,
  selectedScore,
  disabled = false,
  onSelect,
  className = '',
  reviewCount,
  showWhenUnrated = true,
  hideRating = false,
  hideRankBadge = false,
  compact = false,
}: OfferingRatingStarsProps) {
  // interactive（=「あなたの」入力欄）では、未選択時に全体平均へフォールバックさせない。
  // 平均を使ってよいのは読み取り専用の全体表示のときだけ。
  const shownScore = interactive ? selectedScore : selectedScore ?? rating;
  const rounded = shownScore ? Math.round(shownScore) : 0;
  const starSize = size === 'lg' ? 'h-6 w-6 md:h-7 md:w-7' : size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  const textSize = size === 'lg' ? 'text-sm' : 'text-xs';
  const resolvedRank = rank ?? rankForRating(rating);
  const hasReviewCount = reviewCount !== undefined && reviewCount > 0;
  const hasRating = rating !== undefined;
  const showRatingBlock = !hideRating && (hasRating || showWhenUnrated || interactive);

  if (!showRatingBlock && !hasReviewCount) {
    return null;
  }

  if (compact && !interactive) {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {showRatingBlock &&
          (hasRating ? (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] text-gray-600">
                {rating.toFixed(1)}（{count}）
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400">未評価</span>
          ))}
        {hasReviewCount ? <span className="text-[11px] text-gray-500">口コミ{reviewCount}件</span> : null}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showRatingBlock && (
        <>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((score) => {
              const active = score <= rounded;
              const StarIcon = (
                <Star className={`${starSize} ${active ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              );
              if (!interactive) {
                return <span key={score}>{StarIcon}</span>;
              }
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => onSelect?.(score)}
                  disabled={disabled}
                  className="rounded p-0.5 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`おすすめ度 ${score}`}
                >
                  {StarIcon}
                </button>
              );
            })}
          </div>
          {resolvedRank && !hideRankBadge ? (
            <span className={`rounded border px-1.5 py-0.5 font-bold ${textSize} ${rankClass[resolvedRank]}`}>
              {resolvedRank}
            </span>
          ) : null}
          {rating !== undefined ? (
            <span className={`${textSize} text-gray-600`}>
              {rating.toFixed(1)} / 5（{count}件）
            </span>
          ) : (
            <span className={`${textSize} text-gray-400`}>未評価</span>
          )}
        </>
      )}
      {hasReviewCount ? (
        <span className={`${textSize} text-gray-500`}>口コミ{reviewCount}件</span>
      ) : null}
    </div>
  );
}
