interface CourseMetaProps {
  evaluationCriteria: string
  examPolicy: string
  format: string
}

export function CourseMeta({ evaluationCriteria, examPolicy, format }: CourseMetaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 評価基準 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-gray-600 text-sm mb-3">評価基準</h3>
        <p className="text-gray-900">{evaluationCriteria}</p>
      </div>

      {/* 前年度授業形態 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-gray-600 text-sm mb-3">前年度授業形態</h3>
        <p className="text-gray-900">{format}</p>
      </div>

      {/* テスト持ち込み */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-gray-600 text-sm mb-3">テスト持ち込み</h3>
        <p className="text-gray-900">{examPolicy}</p>
      </div>
    </div>
  )
}