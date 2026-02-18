import { ArrowLeft, Heart } from 'lucide-react'

interface CourseHeaderProps {
  onBack: () => void
  isAuthenticated: boolean
  isFavorited: boolean
  favoriteCount: number
  onToggleFavorite: () => void
}

export function CourseHeader({
  onBack,
  isAuthenticated,
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
          {isAuthenticated ? (
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
          ) : (
            <div className="relative group">
              <button
                disabled
                className="p-2 rounded-lg bg-gray-50 cursor-not-allowed"
                aria-label="お気に入り（ログインが必要）"
              >
                <Heart className="w-6 h-6 text-gray-300" />
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                ログインするとお気に入りできます
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
