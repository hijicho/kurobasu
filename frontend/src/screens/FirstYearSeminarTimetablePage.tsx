import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { firstYearSeminarScheduleData, FirstYearSeminarScheduleCourse } from '@/lib/firstYearSeminarScheduleData';

interface FirstYearSeminarTimetablePageProps {
  isAuthenticated: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function FirstYearSeminarTimetablePage({ isAuthenticated, onCourseClick }: FirstYearSeminarTimetablePageProps) {
  const days = ['月', '火', '水', '木', '金'];
  const periods = ['1限', '2限', '3限', '4限', '5限'];

  // 曜日と時限で授業を取得
  const getCoursesByDayAndPeriod = (day: string, period: string): FirstYearSeminarScheduleCourse[] => {
    return firstYearSeminarScheduleData.filter(
      (course) => course.day === day && course.period === period
    );
  };

  // 授業をクリックしたときの処理
  const handleCourseClick = (course: FirstYearSeminarScheduleCourse) => {
    // 詳細ページに遷移する際、courseCodeをidとして使用
    onCourseClick?.(course.courseCode);
  };

  // 科目名から-a/-bを除去してクリーンにする
  const cleanCourseName = (name: string) => {
    return name.replace(/-[ab]$/, '');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '初年次教育科目（初ゼミ）' },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-2">初年次教育科目（初ゼミ）時間割表</h1>
            <p className="text-gray-600 text-sm">授業名をクリックすると詳細が表示されます</p>
          </div>
        </div>

        {/* 時間割表 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#2B4DCA] text-white">
                  <th className="border border-gray-300 p-3 text-sm font-medium min-w-[80px]">
                    時限
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border border-gray-300 p-3 text-sm font-medium min-w-[160px]">
                      {day}曜日
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period}>
                    <td className="border border-gray-200 p-3 bg-gray-50 text-sm font-medium text-gray-700 text-center align-top">
                      {period}
                    </td>
                    {days.map((day) => {
                      const courses = getCoursesByDayAndPeriod(day, period);
                      return (
                        <td key={`${day}-${period}`} className="border border-gray-200 p-2 align-top bg-white">
                          {courses.length > 0 ? (
                            <div className="space-y-2">
                              {courses.map((course) => {
                                return (
                                  <button
                                    key={course.id}
                                    onClick={() => handleCourseClick(course)}
                                    className="relative w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-[#2B4DCA] hover:bg-blue-50 transition-all cursor-pointer group"
                                  >
                                    <div>
                                      <h4 className="text-xs font-medium text-gray-900 group-hover:text-[#2B4DCA] line-clamp-2 mb-1">
                                        {cleanCourseName(course.courseName)}
                                      </h4>
                                      <p className="text-xs text-gray-600">{course.instructor}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 text-center py-4">
                              －
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PC版での補足情報 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 hidden md:block">
          <p className="text-sm text-gray-700">
            <span className="font-medium">ヒント：</span>
            各授業のセルをクリックすると、評価基準やレビューなどの詳細情報が表示されます。
          </p>
        </div>

        {/* 時間割外・遠隔授業セクション */}
        <div className="mt-8">
          <h2 className="mb-4">時間割外・遠隔授業</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {firstYearSeminarScheduleData
              .filter((course) => course.day === '時間割外')
              .map((course) => {
                return (
                  <button
                    key={course.id}
                    onClick={() => onCourseClick?.(course.courseCode)}
                    className="relative text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#2B4DCA] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-[#2B4DCA] mb-2">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                          {course.classroom}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}