'use client';

import { useRouter } from 'next/navigation';
import { FoundationCoursesListPage } from '@/screens/FoundationCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <FoundationCoursesListPage
      onCourseClick={(id) => router.push(`/courses/foundation-list/${id}`)}
    />
  );
}
