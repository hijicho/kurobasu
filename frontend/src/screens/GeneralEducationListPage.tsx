import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { generalEducationCourses, GeneralEducationCourse } from '../lib/generalEducationData';
import { scheduleCoursesData, ScheduleCourse } from '../lib/generalEducationScheduleData';
import { getLevel, LevelType } from '../lib/generalEducationLevelMapping';

interface GeneralEducationListPageProps {
  isAuthenticated: boolean;
  onCourseClick?: (courseId: string) => void;
  onNavigateBack?: () => void;
}

export function GeneralEducationListPage({ isAuthenticated, onCourseClick, onNavigateBack }: GeneralEducationListPageProps) {
  const days = ['月', '火', '水', '木', '金'];
  const periods = ['1限', '2限', '3限', '4限', '5限'];

  // 曜日と時限で授業を取得
  const getCoursesByDayAndPeriod = (day: string, period: string): ScheduleCourse[] => {
    return scheduleCoursesData.filter(
      (course) => course.day === day && course.period === period
    );
  };

  // レビュー数を取得する関数
  const getReviewCount = (courseName: string, instructor: string): number => {
    // 授業名から不要な部分を削除
    const cleanCourseName = courseName.replace(' /全_森', '').replace(' /全(商以外)_森', '').replace(' /全_遠隔', '');
    // 教員名からスペース（全角・半角）を削除
    const cleanInstructor = instructor.replace(/\s+/g, '');
    
    // generalEducationCoursesから該当する授業を検索
    const courseDetail = generalEducationCourses.find(
      (course) => {
        const courseCleanInstructor = course.instructor.replace(/\s+/g, '');
        return course.courseName === cleanCourseName && courseCleanInstructor === cleanInstructor;
      }
    );
    
    if (!courseDetail) return 0;
    
    // レビュー数を計算（goodPoints + badPoints + otherInfo）
    return (
      courseDetail.goodPoints.length +
      courseDetail.badPoints.length +
      courseDetail.otherInfo.length
    );
  };

  // レベルバッジのスタイルを取得
  const getLevelBadgeStyle = (level: LevelType) => {
    if (!level) return { bg: '', text: '', label: '' };
    
    switch (level) {
      case 'AA':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'AA' };
      case 'A':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'A' };
      case 'B':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'B' };
      case 'C':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'C' };
      default:
        return { bg: '', text: '', label: '' };
    }
  };

  // 授業をクリックしたときの処理
  const handleCourseClick = (course: ScheduleCourse) => {
    // 詳細ページに遷移する際、courseCodeをidとして使用
    onCourseClick?.(course.courseCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '総合教養科目（般教）' },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => onNavigateBack?.()}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-2">総合教養科目（般教）時間割表</h1>
            <p className="text-gray-600 text-sm">授業名をクリックすると詳細が表示されます</p>
          </div>
        </div>

        {/* レベル評価の凡例 */}
        <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">レベル評価の見方</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-medium">AA</span>
              <span className="text-sm text-gray-600">楽単！！（非常にとりやすい）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-medium">A</span>
              <span className="text-sm text-gray-600">普通（出席・課題で取れる）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">B</span>
              <span className="text-sm text-gray-600">興味があれば（課題重め）</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">C</span>
              <span className="text-sm text-gray-600">よほど興味があれば（難易度高）</span>
            </div>
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
                                // 授業名と教員名をクリーニング
                                const cleanCourseName = course.courseName.replace(' /全_森', '').replace(' /全(商以外)_森', '').replace(' /全_遠隔', '');
                                const cleanInstructor = course.instructor.replace(/\s+/g, '');
                                
                                const reviewCount = getReviewCount(course.courseName, course.instructor);
                                const level = getLevel(cleanCourseName, cleanInstructor);
                                const levelBadgeStyle = getLevelBadgeStyle(level);
                                return (
                                  <button
                                    key={course.id}
                                    onClick={() => handleCourseClick(course)}
                                    className="relative w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-[#2B4DCA] hover:bg-blue-50 transition-all cursor-pointer group"
                                  >
                                    {/* レベルバッジ（右上） */}
                                    {levelBadgeStyle.label && (
                                      <div
                                        className={`absolute top-1 right-1 ${levelBadgeStyle.bg} ${levelBadgeStyle.text} text-[10px] px-1.5 py-0.5 rounded font-medium`}
                                      >
                                        {levelBadgeStyle.label}
                                      </div>
                                    )}
                                    
                                    <div className="pr-8">
                                      <h4 className="text-xs font-medium text-gray-900 group-hover:text-[#2B4DCA] line-clamp-2 mb-1">
                                        {cleanCourseName}
                                      </h4>
                                      <p className="text-xs text-gray-600 mb-1">{course.instructor}</p>
                                      
                                      {/* レビュー数（左下） */}
                                      <div className="text-[10px] text-gray-500">
                                        レビュー数：{reviewCount}
                                      </div>
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
            <span className="font-medium">💡 ヒント：</span>
            各授業のセルをクリックすると、評価基準やレビューなどの詳細情報が表示されます。
          </p>
        </div>

        {/* 時間割外・集中講義セクション */}
        <div className="mt-8">
          <h2 className="mb-4">集中講義・遠隔授業</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generalEducationCourses
              .filter((course) => course.day === '時間割外')
              .map((course) => {
                // レベル評価を取得
                const cleanCourseName = course.courseName;
                const cleanInstructor = course.instructor.replace(/\s+/g, '');
                const level = getLevel(cleanCourseName, cleanInstructor);
                const levelBadgeStyle = getLevelBadgeStyle(level);
                
                return (
                  <button
                    key={course.id}
                    onClick={() => onCourseClick?.(course.id)}
                    className="relative text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-[#2B4DCA] hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* レベルバッジ（右上） */}
                    {levelBadgeStyle.label && (
                      <div
                        className={`absolute top-3 right-3 ${levelBadgeStyle.bg} ${levelBadgeStyle.text} text-xs px-2 py-1 rounded font-medium`}
                      >
                        {levelBadgeStyle.label}
                      </div>
                    )}
                    
                    <div className="pr-10">
                      <h3 className="font-medium text-gray-900 group-hover:text-[#2B4DCA] mb-2">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            course.format === '対面'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }`}
                        >
                          {course.format}
                        </span>
                        <span className="text-xs text-gray-500">{course.period}</span>
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