import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface MedicalRehabCourseDetailPageProps {
  courseId?: string;
  isAuthenticated?: boolean;
}

interface CourseData {
  name: string;
  instructor: string;
  evaluationCriteria: string;
  allowedMaterials: string;
  pros: string[];
  cons: string[];
  others: string[];
}

export function MedicalRehabCourseDetailPage({ courseId = 'morphology-function-1-miyai', isAuthenticated = false }: MedicalRehabCourseDetailPageProps) {
  const getCourseData = (id: string): CourseData => {
    const courses: Record<string, CourseData> = {
      'morphology-function-1-miyai': {
        name: '形態機能学1',
        instructor: '宮井',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト問題がわかるからそこさえ覚えれば最低限の点数は取れる',
          '先生がかわいい',
          '出席して課題出しておけば結構点稼げる',
        ],
        cons: [
          '毎回小テストと問題作成するのがめんどくさい',
        ],
        others: [
          '特になし',
        ],
      },
      'morphology-function-practice-1-miyai': {
        name: '形態機能学実習1',
        instructor: '宮井',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '後半はちゃんとスケッチ出せばめっちゃ加点してくれる',
        ],
        cons: [
          '2時限連続がしんどい',
        ],
        others: [
          '特になし',
        ],
      },
    };

    return courses[id] || courses['morphology-function-1-miyai'];
  };

  const courseData = getCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '医学部リハビリテーション学科科目一覧', href: '/courses/specialized/medical-rehab' },
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

        {/* 良かったところ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h2 className="text-lg md:text-xl font-bold">良かったところ</h2>
          </div>
          <ul className="space-y-2">
            {courseData.pros.map((pro, index) => (
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
            {courseData.cons.map((con, index) => (
              <li key={index} className="flex gap-2 text-sm md:text-base">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{con}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* その他 */}
        {courseData.others.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h2 className="text-lg md:text-xl font-bold">その他</h2>
            </div>
            <ul className="space-y-2">
              {courseData.others.map((other, index) => (
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
