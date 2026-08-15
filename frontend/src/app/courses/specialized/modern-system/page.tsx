'use client';

import { useRouter } from 'next/navigation';
import { ModernSystemCoursesListPage } from '@/screens/ModernSystemCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <ModernSystemCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/modern-system/${id}`)}
    />
  );
}
