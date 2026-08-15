'use client';

import { useRouter } from 'next/navigation';
import { ScienceCoursesListPage } from '@/screens/ScienceCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <ScienceCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/science/${id}`)}
    />
  );
}
