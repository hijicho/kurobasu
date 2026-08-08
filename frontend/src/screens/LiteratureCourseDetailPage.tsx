import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { ReviewSections } from '../components/course-detail/ReviewSections';
import { getCourseDataById } from '../data/literatureCourses';

interface LiteratureCourseDetailPageProps {
  courseId?: string;
  isAuthenticated?: boolean;
}

export function LiteratureCourseDetailPage({ courseId = 'folklore-ono', isAuthenticated = false }: LiteratureCourseDetailPageProps) {
  const courseData = getCourseDataById(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '文学部科目一覧', href: '/courses/specialized/literature' },
          { label: courseData.name },
        ]} />

        {/* 科目名・教員名 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">{courseData.name}</h1>
          <p className="text-sm md:text-base text-gray-600">担当教員：{courseData.instructor}</p>
        </div>

        {/* 評価基準・持ち込み */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">評価基準</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.evaluationCriteria}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">テスト持ち込み</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.allowedMaterials}</p>
            </div>
          </div>
        </div>

        <ReviewSections pros={courseData.pros} cons={courseData.cons} others={courseData.others} />
      </main>

      <Footer />
    </div>
  );
}
