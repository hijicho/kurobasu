import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import modernSystemCourses from '../data/modernSystemCourses';

interface ModernSystemCourseDetailPageProps {
  courseId?: string;
  isAuthenticated?: boolean;
  onNavigateToList?: () => void;
}

export function ModernSystemCourseDetailPage({ courseId = '', isAuthenticated = false }: ModernSystemCourseDetailPageProps) {
  // Use the same slug strategy as the list page: encodeURIComponent so Japanese characters are preserved
  const slugify = (s: string) => encodeURIComponent((s ?? '').trim());

  const list = modernSystemCourses?.courses ?? [];
  const course: any =
    list.find((c: any) => slugify(c.subject ?? c.name ?? '') === courseId) ||
    list.find((c: any) => slugify(c.subject ?? c.name ?? '') === (courseId || '')) ||
    list[0] ||
    null;

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header isAuthenticated={isAuthenticated} />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
          <p className="text-center text-gray-600">科目情報が見つかりませんでした</p>
        </main>
        <Footer />
      </div>
    );
  }

  const name = course.subject ?? course.name ?? '';
  const instructor = course.instructor ?? '';
  const evaluationCriteria = course.evaluation_criteria ?? course.evaluationCriteria ?? '';
  const allowedMaterials = course.test_items_allowed ?? course.allowedMaterials ?? '';
  const pros: string[] = course.pros ?? course.good ?? [];
  const cons: string[] = course.cons ?? course.bad ?? [];
  const others: string[] = course.notes ?? course.others ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb
          items={[
            { label: 'トップ', href: '/' },
            { label: '現代システム科学域科目一覧', href: '/courses/specialized/modern-system' },
            { label: name },
          ]}
        />

        {/* 科目名・教員名 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">{name}</h1>
          <p className="text-sm md:text-base text-gray-600">担当教員：{instructor}</p>
        </div>

        {/* 評価基準・持ち込み */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">評価基準</h3>
              <p className="text-sm md:text-base text-gray-700">{evaluationCriteria}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">テスト持ち込み</h3>
              <p className="text-sm md:text-base text-gray-700">{allowedMaterials}</p>
            </div>
          </div>
        </div>

        {/* 良かったところ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h2 className="text-lg md:text-xl font-bold">良かったところ</h2>
          </div>
          <ul className="space-y-2">
            {(pros.length ? pros : ['(記載なし)']).map((pro, index) => (
              <li key={index} className="flex gap-2 text-sm md:text-base">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 悪かったところ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            <h2 className="text-lg md:text-xl font-bold">悪かったところ</h2>
          </div>
          <ul className="space-y-2">
            {(cons.length ? cons : ['(記載なし)']).map((con, index) => (
              <li key={index} className="flex gap-2 text-sm md:text-base">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{con}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* その他 */}
        {(others.length > 0 || false) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h2 className="text-lg md:text-xl font-bold">その他</h2>
            </div>
            <ul className="space-y-2">
              {(others.length ? others : ['(記載なし)']).map((other, index) => (
                <li key={index} className="flex gap-2 text-sm md:text-base">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{other}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
