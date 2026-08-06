'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ModernSystemCourseDetailPage } from '@/screens/ModernSystemCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <ModernSystemCourseDetailPage
      courseId={params.id}
      isAuthenticated={isAuthenticated}
      onNavigateToList={() => router.push('/courses/specialized/modern-system')}
    />
  );
}
