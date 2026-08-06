interface CourseSummaryProps {
  courseName: string
  instructor: string
  rating: 'AA' | 'A' | 'B' | 'C'
  selectedYear?: string
  years?: string[]
  onYearChange?: (year: string) => void
}

export function CourseSummary({ courseName, instructor, rating, selectedYear, years, onYearChange }: CourseSummaryProps) {
  // 評価バッジのスタイル
  const getRatingStyle = (rating: string) => {
    const styles = {
      AA: 'bg-green-100 border-green-300 text-green-800',
      A: 'bg-blue-100 border-blue-300 text-blue-800',
      B: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      C: 'bg-red-100 border-red-300 text-red-800',
    }
    return styles[rating as keyof typeof styles] || styles.A
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h1 className="flex-1">{courseName}</h1>
        {/* 総合評価バッジ */}
        <span
          className={`px-4 py-2 border-2 rounded-xl shrink-0 ${getRatingStyle(rating)}`}
        >
          {rating}
        </span>
      </div>
      <p className="text-gray-600 mb-4">担当教員：{instructor}</p>
      
      {/* 年度選択 */}
      {years && years.length > 0 && onYearChange && (
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                selectedYear === year
                  ? 'btn-theme-primary'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {year}年度
            </button>
          ))}
        </div>
      )}
    </div>
  )
}