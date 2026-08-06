'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ModernSystemCoursesListPage } from '@/screens/ModernSystemCoursesListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <ModernSystemCoursesListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/specialized/modern-system/${id}`)}
    />
  );
}
