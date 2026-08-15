'use client';

import { useRouter } from 'next/navigation';
import { LawCoursesListPage } from '@/screens/LawCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <LawCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/law/${id}`)}
    />
  );
}
