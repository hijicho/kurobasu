'use client'

import { ReactNode } from 'react';
import { Star } from 'lucide-react';

export interface CourseCard {
  id: string;
  name: string;
  instructor: string;
  ratingAverage?: number;
  ratingCount: number;
  ratingRank?: 'AA' | 'A' | 'B' | 'C';
  courseCode?: string; // コース番号（例：1GBA001003）
  credits?: number; // 単位数（例：2.0）
}

interface TimetableSlot {
  period: number;
  day: number; // 0=月, 1=火, 2=水, 3=木, 4=金
  courses: CourseCard[];
}

interface TimetableViewProps {
  slots: TimetableSlot[];
  onCourseClick?: (courseId: string) => void;
  className?: string;
}

const getLevelColor = (rank?: string) => {
  switch (rank) {
    case 'AA':
      return 'border-[#fc9c5a]';
    case 'A':
      return 'border-[#f82501]';
    case 'B':
      return 'border-[#27ac49]';
    case 'C':
      return 'border-[#22b0ec]';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getLevelBackgroundStyle = (rank?: string) => {
  switch (rank) {
    case 'AA':
      return { backgroundColor: 'rgba(252, 156, 90, 0.05)' };
    case 'A':
      return { backgroundColor: 'rgba(248, 37, 1, 0.05)' };
    case 'B':
      return { backgroundColor: 'rgba(39, 172, 73, 0.05)' };
    case 'C':
      return { backgroundColor: 'rgba(34, 176, 236, 0.05)' };
    default:
      return {};
  }
};

const getLevelBadgeColor = (rank?: string) => {
  switch (rank) {
    case 'AA':
      return 'bg-[#fc9c5a] border-[#fc9c5a] text-white';
    case 'A':
      return 'bg-[#f82501] border-[#f82501] text-white';
    case 'B':
      return 'bg-[#27ac49] border-[#27ac49] text-white';
    case 'C':
      return 'bg-[#22b0ec] border-[#22b0ec] text-white';
    default:
      return 'bg-gray-200 border-gray-300 text-gray-800';
  }
};

// 星評価を表示するコンポーネント
function StarRating({ rating, count }: { rating?: number; count: number }) {
  if (!count || rating === undefined) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Star className="w-3 h-3" />
        <span>未評価</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            rating && star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-gray-600 ml-1">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export function TimetableView({ slots, onCourseClick, className = '' }: TimetableViewProps) {
  const days = ['月', '火', '水', '木', '金'];
  const periods = [1, 2, 3, 4, 5];

  const getCoursesByDayPeriod = (day: number, period: number): CourseCard[] => {
    const slot = slots.find(s => s.day === day && s.period === period);
    return slot?.courses || [];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[820px]">
          <thead className="bg-[#2B4DCA] sticky top-0 z-10">
            <tr>
              <th className="border border-gray-200 p-3 text-sm font-medium text-white w-16">時限</th>
              {days.map((day, index) => (
                <th key={index} className="border border-gray-200 p-3 text-sm font-medium text-white min-w-[190px]">
                  {day}曜日
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period}>
                <td className="border border-gray-200 p-3 text-center bg-gray-50 align-top">
                  <span className="text-sm">{period}限</span>
                </td>
                {days.map((_, dayIndex) => {
                  const courses = getCoursesByDayPeriod(dayIndex, period);
                  return (
                    <td key={dayIndex} className="border border-gray-200 p-2 align-top">
                      <div className="space-y-2">
                        {courses.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => onCourseClick?.(course.id)}
                            className={`w-full p-3 rounded-lg border text-left hover:shadow-md transition-all relative ${getLevelColor(course.ratingRank)}`}
                            style={getLevelBackgroundStyle(course.ratingRank)}
                          >
                            {course.ratingRank && (
                              <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded border ${getLevelBadgeColor(course.ratingRank)}`}>
                                {course.ratingRank}
                              </span>
                            )}

                            {/* 授業名 */}
                            <div className="text-sm mb-1.5 pr-10">{course.name}</div>

                            {/* 担当教員 */}
                            <div className="text-xs text-gray-600">{course.instructor}</div>

                            <div className="mt-2">
                              <StarRating rating={course.ratingAverage} count={course.ratingCount} />
                              {course.ratingAverage !== undefined ? (
                                <div className="mt-1 text-xs text-gray-500">
                                  おすすめ度 {course.ratingAverage.toFixed(1)} / 5（{course.ratingCount}件）
                                </div>
                              ) : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 注釈 */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <p className="text-xs text-gray-600">
          ※ クリックすると授業の詳細ページに移動します。
        </p>
      </div>
    </div>
  );
}
