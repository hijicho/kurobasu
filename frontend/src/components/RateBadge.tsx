// AA/A/B/C のおすすめ度ランクバッジ。凡例（CategoryPage の Lv 表）と同じ配色。
export const rateBadgeClasses: Record<string, string> = {
  AA: 'bg-orange-100 text-orange-700',
  A: 'bg-red-100 text-red-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-blue-100 text-blue-700',
};

interface RateBadgeProps {
  rate?: string;
  className?: string;
}

export function RateBadge({ rate, className = '' }: RateBadgeProps) {
  if (!rate || !rateBadgeClasses[rate]) return null;
  return (
    <span className={`inline-flex items-center justify-center rounded px-2 py-1 font-extrabold ${rateBadgeClasses[rate]} ${className}`}>
      {rate}
    </span>
  );
}
