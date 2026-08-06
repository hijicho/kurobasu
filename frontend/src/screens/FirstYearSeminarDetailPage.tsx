import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArrowLeft, Clock, MapPin, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { firstYearSeminarScheduleData } from '@/lib/firstYearSeminarScheduleData';

interface FirstYearSeminarDetailPageProps {
  courseId: string;
  isAuthenticated: boolean;
  onBack?: () => void;
}

export function FirstYearSeminarDetailPage({ courseId, isAuthenticated, onBack }: FirstYearSeminarDetailPageProps) {
  // courseIdで授業を検索
  const course = firstYearSeminarScheduleData.find(c => c.courseCode === courseId);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">授業が見つかりませんでした</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 授業名から-a, -bを削除
  const displayCourseName = course.courseName.replace(/-[a-z]$/, '');

  // デフォルトのレビュー情報（今後、実データで更新予定）
  const evaluationCriteria = ['レポート', '平常点'];
  const testAllowance = ['なし'];
  const goodPoints: string[] = [];
  const badPoints: string[] = [];
  const otherInfo: string[] = [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '初年次教育科目（初ゼミ）', href: '/courses/first-year-education' },
          { label: displayCourseName },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onBack || (() => window.history.back())}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-1">{displayCourseName}</h1>
            <p className="text-gray-600">{course.instructor}</p>
          </div>
        </div>

        {/* 授業基本情報 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">授業情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 mb-1">授業コード</div>
                <div className="text-sm font-medium text-gray-900">{course.courseCode}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 mb-1">開講時期</div>
                <div className="text-sm font-medium text-gray-900">
                  {course.day === '時間割外' ? '時間割外' : `${course.day}曜日 ${course.period}`}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm text-gray-600 mb-1">講義室</div>
                <div className="text-sm font-medium text-gray-900">{course.classroom}</div>
              </div>
            </div>
            
            {course.note && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-600 mb-1">備考</div>
                  <div className="text-sm font-medium text-orange-700">
                    <span className="inline-block px-2 py-1 bg-orange-100 rounded">
                      {course.note}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 評価基準とテスト持ち込み（2列カード） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 評価基準 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              評価基準
            </h3>
            {evaluationCriteria.length > 0 ? (
              <ul className="space-y-2">
                {evaluationCriteria.map((criterion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">情報がありません</p>
            )}
          </div>

          {/* テスト持ち込み */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              テスト持ち込み
            </h3>
            {testAllowance.length > 0 ? (
              <ul className="space-y-2">
                {testAllowance.map((allowance, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{allowance}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">情報がありません</p>
            )}
          </div>
        </div>

        {/* 良かったところ */}
        {goodPoints.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              良かったところ
            </h3>
            <ul className="space-y-2">
              {goodPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 悪かったところ */}
        {badPoints.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              悪かったところ
            </h3>
            <ul className="space-y-2">
              {badPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* その他 */}
        {otherInfo.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              その他
            </h3>
            <ul className="space-y-2">
              {otherInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600 mt-2 flex-shrink-0"></span>
                  <span className="text-sm text-gray-700">{info}</span>
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