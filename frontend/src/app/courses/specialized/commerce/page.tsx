'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CommerceCoursesListPage } from '@/screens/CommerceCoursesListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <CommerceCoursesListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/specialized/commerce/${id}`)}
    />
  );
}
