'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EconomicsCoursesListPage } from '@/screens/EconomicsCoursesListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <EconomicsCoursesListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/specialized/economics/${id}`)}
    />
  );
}
