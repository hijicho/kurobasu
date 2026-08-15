'use client';

import { useRouter } from 'next/navigation';
import { LiteratureCoursesListPage } from '@/screens/LiteratureCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <LiteratureCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/literature/${id}`)}
    />
  );
}
