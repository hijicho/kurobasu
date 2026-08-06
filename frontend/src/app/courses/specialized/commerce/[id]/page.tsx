'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CommerceCourseDetailPage } from '@/screens/CommerceCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <CommerceCourseDetailPage
      courseId={params.id}
      isAuthenticated={isAuthenticated}
      onNavigateToList={() => router.push('/courses/specialized/commerce')}
    />
  );
}
