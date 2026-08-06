import { generalEducationCourses, GeneralEducationCourse } from './generalEducationData';
import { getLevel } from './generalEducationLevelMapping';

// TimetableView用のデータ型
export interface TimetableCourse {
  id: string;
  name: string;
  instructor: string;
  format: string;
  level: 'AA' | 'A' | 'B' | 'C'; // 必須（レベル評価がある授業のみ表示）
  ratingCount?: number;
  courseCode: string;
}

export interface TimetableSlot {
  period: number;
  day: number; // 0=月, 1=火, 2=水, 3=木, 4=金
  courses: TimetableCourse[];
}

// 曜日の日本語を数値に変換
function getDayNumber(dayStr: string): number {
  const dayMap: Record<string, number> = {
    '月曜日': 0,
    '火曜日': 1,
    '水曜日': 2,
    '木曜日': 3,
    '金曜日': 4,
  };
  return dayMap[dayStr] ?? -1;
}

// 時限を数値に変換
function getPeriodNumber(periodStr: string): number {
  const match = periodStr.match(/(\d+)限目/);
  return match ? parseInt(match[1], 10) : -1;
}

// レビュー数を計算（良い点+悪い点の合計）
function calculateRatingCount(course: GeneralEducationCourse): number {
  return course.goodPoints.length + course.badPoints.length;
}

// generalEducationCoursesをTimetableSlots形式に変換
export function convertToTimetableSlots(): TimetableSlot[] {
  const slotsMap = new Map<string, TimetableCourse[]>();

  generalEducationCourses.forEach((course) => {
    const dayNum = getDayNumber(course.day);
    const periodNum = getPeriodNumber(course.period);

    // 時間割外（集中講義・遠隔授業）は除外
    if (dayNum === -1 || periodNum === -1) {
      return;
    }

    const level = getLevel(course.courseName, course.instructor);
    
    // levelがnullの場合はスキップ（レベル評価がない授業は時間割に表示しない）
    if (!level) {
      return;
    }

    const ratingCount = calculateRatingCount(course);

    const timetableCourse: TimetableCourse = {
      id: course.id,
      name: course.courseName,
      instructor: course.instructor,
      format: course.format,
      level: level,
      ratingCount: ratingCount,
      courseCode: course.courseCode,
    };

    const key = `${dayNum}-${periodNum}`;
    if (!slotsMap.has(key)) {
      slotsMap.set(key, []);
    }
    slotsMap.get(key)!.push(timetableCourse);
  });

  // MapをTimetableSlot配列に変換
  const slots: TimetableSlot[] = [];
  slotsMap.forEach((courses, key) => {
    const [dayStr, periodStr] = key.split('-');
    slots.push({
      day: parseInt(dayStr, 10),
      period: parseInt(periodStr, 10),
      courses: courses,
    });
  });

  return slots;
}