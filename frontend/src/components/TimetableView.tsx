'use client'

import { ReactNode } from 'react';
import { Star } from 'lucide-react';

interface CourseCard {
  id: string;
  name: string;
  instructor: string;
  format: string; // 対面/遠隔
  level: 'AA' | 'A' | 'B' | 'C';
  rating?: number; // 平均評価（1-5）
  ratingCount?: number; // 評価数
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

const getLevelColor = (level: string) => {
  switch (level) {
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

const getLevelBackgroundStyle = (level: string) => {
  switch (level) {
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

const getLevelBadgeColor = (level: string) => {
  switch (level) {
    case 'AA':
      return 'text-[#fc9c5a]';
    case 'A':
      return 'text-[#f82501]';
    case 'B':
      return 'text-[#27ac49]';
    case 'C':
      return 'text-[#22b0ec]';
    default:
      return 'text-gray-800';
  }
};

// 星評価を表示するコンポーネント
function StarRating({ rating, count }: { rating?: number; count?: number }) {
  if (!count || count < 4) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Star className="w-3 h-3" />
        <span>評価数不足</span>
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
        <table className="w-full border-collapse min-w-[800px]">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-200 p-3 text-sm w-20">時限</th>
              {days.map((day, index) => (
                <th key={index} className="border border-gray-200 p-3 text-sm">
                  {day}
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
                            className={`w-full p-2 rounded-lg border text-left hover:shadow-md transition-all ${getLevelColor(course.level)}`}
                            style={getLevelBackgroundStyle(course.level)}
                          >
                            <div className="text-xs mb-1 line-clamp-2">{course.name}</div>
                            <div className="text-xs text-gray-600 mb-1">{course.instructor}</div>
                            
                            {/* 星評価表示 */}
                            <div className="mb-1">
                              <StarRating rating={course.rating} count={course.ratingCount} />
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-white px-1.5 py-0.5 rounded">
                                {course.format}
                              </span>
                              <span className={`text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                                Lv: {course.level}
                              </span>
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
          ※ 星評価は評価数が4件以上の授業のみ表示されます。評価数3件以下の場合は「評価数不足」と表示されます。
        </p>
      </div>
    </div>
  );
}