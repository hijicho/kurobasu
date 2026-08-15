import { ArrowLeft, Heart } from 'lucide-react'

interface CourseHeaderProps {
  onBack: () => void
  isFavorited: boolean
  favoriteCount: number
  onToggleFavorite: () => void
}

export function CourseHeader({
  onBack,
  isFavorited,
  favoriteCount,
  onToggleFavorite,
}: CourseHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* 左：戻る */}
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="戻る"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 右：お気に入り＋数表示 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{favoriteCount}</span>
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorited ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-gray-100'
            }`}
            aria-label={isFavorited ? 'お気に入り解除' : 'お気に入り追加'}
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorited ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  )
}
