'use client';

import { useRouter } from 'next/navigation';
import { EconomicsCoursesListPage } from '@/screens/EconomicsCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <EconomicsCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/economics/${id}`)}
    />
  );
}
