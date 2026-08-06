'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EngineeringCoursesListPage } from '@/screens/EngineeringCoursesListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <EngineeringCoursesListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/specialized/engineering/${id}`)}
    />
  );
}
