import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import modernSystemCourses from '../data/modernSystemCourses';

interface ModernSystemCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function ModernSystemCoursesListPage({ isAuthenticated = false, onCourseClick }: ModernSystemCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // slugify used to generate stable ids/paths from subject names
  // Use encodeURIComponent so non-latin characters (e.g. Japanese) produce stable, reversible slugs
  const slugify = (s: string) => encodeURIComponent((s ?? '').trim());

  // Build course list from the canonical JSON data
  const courses = (modernSystemCourses?.courses ?? []).map((c: any, idx: number) => ({
    id: slugify(c.subject ?? c.name ?? `course-${idx}`),
    name: c.subject ?? c.name ?? '',
    instructor: (c.instructor ?? '') as string,
  }));

  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return course.name.toLowerCase().includes(query) || course.instructor.toLowerCase().includes(query);
  });

  const handleCourseClick = (courseId: string) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[{ label: 'トップ', href: '/' }, { label: '現代システム科学域科目一覧' }]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">現代システム科学域科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="授業名・担当教員で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] focus:border-transparent"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs md:text-sm text-gray-500 text-center">{filteredCourses.length}件の科目が見つかりました</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <a
              key={course.id}
              href={`/courses/specialized/modern-system/${course.id}`}
              onClick={() => handleCourseClick(course.id)}
              className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-[#2B4DCA] hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base md:text-lg mb-1 text-[#2B4DCA] hover:underline">{course.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">担当教員：{course.instructor}</p>
                </div>
                <div className="text-gray-400 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}