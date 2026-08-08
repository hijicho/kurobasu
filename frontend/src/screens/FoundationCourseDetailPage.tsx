import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { ReviewSections } from '../components/course-detail/ReviewSections';
import { getFoundationCourseData, FoundationCourseData } from '../lib/foundationEducationData';

interface FoundationCourseDetailPageProps {
  courseId?: string;
  isAuthenticated?: boolean;
}

export function FoundationCourseDetailPage({ courseId = 'kaiseki-1-yamana', isAuthenticated = false }: FoundationCourseDetailPageProps) {
  const course = getFoundationCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '基礎教育科目', href: '/courses/foundation-list' },
          { label: course.name },
        ]} />

        <div className="space-y-4 md:space-y-6">
          {/* 科目名 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <h1 className="mb-2 text-xl md:text-3xl">{course.name}</h1>
            <p className="text-gray-600 text-sm md:text-base">担当教員：{course.instructor}</p>
          </div>

          {/* 横並び2カード（評価基準とテスト持ち込み） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 評価基準 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
              <h3 className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">評価基準</h3>
              <p className="text-gray-900 text-sm md:text-base">{course.evaluationCriteria}</p>
            </div>

            {/* テスト持ち込み */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
              <h3 className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">テスト持ち込み</h3>
              <p className="text-gray-900 text-sm md:text-base">{course.allowedMaterials}</p>
            </div>
          </div>

          <ReviewSections pros={course.pros} cons={course.cons} others={course.others} />
        </div>
      </main>

      <Footer />
    </div>
  );
}