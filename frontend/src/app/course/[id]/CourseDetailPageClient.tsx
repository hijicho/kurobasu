'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import { CourseHeader } from '@/components/course-detail/CourseHeader'
import { CourseSummary } from '@/components/course-detail/CourseSummary'
import { CourseMeta } from '@/components/course-detail/CourseMeta'
import { ProsConsSection } from '@/components/course-detail/ProsConsSection'

export default function CourseDetailPageClient({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedYear, setSelectedYear] = useState('2025')

  // TODO: 実際の認証状態を取得
  const isAuthenticated = true
  const favoriteCount = 128
  
  const years = ['2025', '2024', '2023']

  // サンプルデータ
  const course = {
    name: '子どもの生活と健康教育',
    instructor: '三宅孝昭',
    rating: 'A' as const,
    evaluationCriteria: '期末テスト、期末レポート、毎回の課題',
    examPolicy: '教科書',
    format: 'PDF資料配布、動画配信などのオンデマンド授業・実習、対面授業・実習',
    pros: [
      '遠隔動画を見なくてもテストは余裕だった',
      '全てオンデマンド形式',
      '成績評価がテスト100％',
      '勉強しなくても教科書があれば単位が取れる',
      '教科書代3500円で単位を買ったような感覚',
    ],
    cons: [
      '教科書が高い',
      '教科書の書き抜き問題なのに成績評価が悪く、なぜB評価なのか分からなかった',
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* A. ヘッダー */}
      <CourseHeader
        onBack={() => router.back()}
        isAuthenticated={isAuthenticated}
        isFavorited={isFavorited}
        favoriteCount={favoriteCount}
        onToggleFavorite={() => setIsFavorited(!isFavorited)}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-6 space-y-6">
        {/* B. 科目サマリー（ヒーロー領域） */}
        <CourseSummary
          courseName={course.name}
          instructor={course.instructor}
          rating={course.rating}
          selectedYear={selectedYear}
          years={years}
          onYearChange={setSelectedYear}
        />

        {/* C. 基本情報（横並び3カード） */}
        <CourseMeta
          evaluationCriteria={course.evaluationCriteria}
          examPolicy={course.examPolicy}
          format={course.format}
        />

        {/* D. 良かったところ */}
        <ProsConsSection
          title="良かったところ"
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="text-green-600"
          bulletColor="text-green-600"
          items={course.pros}
        />

        {/* E. 悪かったところ */}
        <ProsConsSection
          title="悪かったところ"
          icon={<XCircle className="w-5 h-5" />}
          iconColor="text-red-600"
          bulletColor="text-red-600"
          items={course.cons}
        />
      </main>
    </div>
  )
}