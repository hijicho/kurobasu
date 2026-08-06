'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LifeScienceCoursesListPage } from '@/screens/LifeScienceCoursesListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <LifeScienceCoursesListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/specialized/human-life/${id}`)}
    />
  );
}
