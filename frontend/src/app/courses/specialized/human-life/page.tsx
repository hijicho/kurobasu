'use client';

import { useRouter } from 'next/navigation';
import { LifeScienceCoursesListPage } from '@/screens/LifeScienceCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <LifeScienceCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/human-life/${id}`)}
    />
  );
}
