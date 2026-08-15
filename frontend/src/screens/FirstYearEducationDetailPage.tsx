import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { ArrowLeft, MapPin, Calendar, Users, BookOpen } from 'lucide-react';
import { firstYearEducationCourses } from '../lib/firstYearEducationData';
import { firstYearSeminarScheduleData } from '../lib/firstYearSeminarScheduleData';
import { findOfferingIdByCourse } from '../lib/offeringLookup';
import { ReviewSections } from '../components/course-detail/ReviewSections';

interface FirstYearEducationDetailPageProps {
  courseId: string;
  onNavigateToList?: () => void;
}

export function FirstYearEducationDetailPage({ courseId, onNavigateToList }: FirstYearEducationDetailPageProps) {
  // まず詳細データから検索
  let course = firstYearEducationCourses.find(c => c.courseCode === courseId);
  
  // 見つからない場合は、時間割データからcourseCodeで検索
  let scheduleCourse = null;
  if (!course) {
    scheduleCourse = firstYearSeminarScheduleData.find(c => c.courseCode === courseId);
    
    // 時間割データが見つかった場合、科目名と教員名で詳細データを検索
    if (scheduleCourse) {
      const courseName = scheduleCourse.courseName;
      const instructor = scheduleCourse.instructor.replace(/\s+/g, '');
      
      // firstYearEducationDataから科目名と教員名が一致するものを探す
      course = firstYearEducationCourses.find((c) => {
        const cName = c.courseName.replace(/\s+/g, '');
        const cInstructor = c.instructor.replace(/\s+/g, '');
        return cName === courseName.replace(/\s+/g, '') && cInstructor === instructor;
      });
    }
  }

  // どちらも見つからない場合
  if (!course && !scheduleCourse) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
          <p className="text-center text-gray-600">授業が見つかりませんでした。</p>
        </main>
        <Footer />
      </div>
    );
  }

  // 時間割データの場合で、詳細データが見つからなかった場合のみモック表示
  if (scheduleCourse && !course) {
    const offeringId = findOfferingIdByCourse(
      scheduleCourse.courseCode,
      scheduleCourse.courseName,
      scheduleCourse.instructor
    );

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
          <Breadcrumb items={[
            { label: 'トップ', href: '/' },
            { label: '初年次教育科目（初ゼミ）', onClick: onNavigateToList },
            { label: scheduleCourse.courseName },
          ]} />

          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => onNavigateToList ? onNavigateToList() : window.history.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="mb-2">{scheduleCourse.courseName}</h1>
              <p className="text-gray-600 text-sm">担当教員: {scheduleCourse.instructor}</p>
            </div>
          </div>

          {/* 基本情報カード */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">担当教員</p>
                  <p className="font-medium">{scheduleCourse.instructor}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">曜日・時限</p>
                  <p className="font-medium">
                    {scheduleCourse.day === '時間割外' 
                      ? '時間割外' 
                      : `${scheduleCourse.day}曜日 ${scheduleCourse.period}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">講義室</p>
                  <p className="font-medium">{scheduleCourse.classroom || '未定'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">授業コード</p>
                  <p className="font-medium text-sm">{scheduleCourse.courseCode}</p>
                </div>
              </div>
            </div>
            {scheduleCourse.note && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-3 py-1.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                    {scheduleCourse.note}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 評価基準とテスト持ち込み */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="mb-3 text-sm text-gray-600">評価基準</h3>
              <p className="text-gray-500 text-sm">
                詳細な評価基準はシラバスをご確認ください
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="mb-3 text-sm text-gray-600">テスト持ち込み</h3>
              <p className="text-gray-500 text-sm">
                詳細はシラバスをご確認ください
              </p>
            </div>
          </div>

          <div className="mb-6">
            <ReviewSections pros={[]} cons={[]} others={[]} offeringId={offeringId} />
          </div>

          {/* 注意事項 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>注意：</strong>履修登録の際は、必ず最新のシラバスを確認してください。授業内容や評価方法は変更される場合があります。
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // 既存の詳細データが見つかった場合
  if (!course) {
    return null;
  }

  const offeringId = findOfferingIdByCourse(course.courseCode, course.courseName, course.instructor);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '初年次教育科目（初ゼミ）', onClick: onNavigateToList },
          { label: course.courseName },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => onNavigateToList ? onNavigateToList() : window.history.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="mb-2">{course.courseName}</h1>
            <p className="text-gray-600 text-sm">担当教員: {course.instructor}</p>
          </div>
        </div>

        {/* 基本情報カード */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">担当教員</p>
                <p className="font-medium">{course.instructor}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">曜日・時限</p>
                <p className="font-medium">
                  {course.day === '時間割外' 
                    ? '時間割外' 
                    : `${course.day}曜日 ${course.period}`}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">講義室</p>
                <p className="font-medium">{course.classroom}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-[#2B4DCA] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">授業コード</p>
                <p className="font-medium text-sm">{course.courseCode}</p>
              </div>
            </div>
          </div>
          {course.note && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm px-3 py-1.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200">
                  {course.note}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 評価基準とテスト持ち込み */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="mb-3">評価基準</h3>
            {course.evaluationCriteria && course.evaluationCriteria.length > 0 ? (
              <ul className="space-y-2">
                {course.evaluationCriteria.map((criterion, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed text-sm">
                    {criterion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">記載なし</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="mb-3">テスト持ち込み</h3>
            {course.testAllowance && course.testAllowance.length > 0 ? (
              <ul className="space-y-2">
                {course.testAllowance.map((allowance, index) => (
                  <li key={index} className="text-gray-700 leading-relaxed text-sm">
                    {allowance}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">記載なし</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <ReviewSections
            pros={course.goodPoints ?? []}
            cons={course.badPoints ?? []}
            others={course.otherInfo ?? []}
            offeringId={offeringId}
          />
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>注意：</strong>この情報は学生からの投稿に基づいています。履修登録の際は、必ず最新のシラバスを確認してください。
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
