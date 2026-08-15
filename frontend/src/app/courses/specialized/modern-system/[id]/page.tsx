'use client';

import { useParams, useRouter } from 'next/navigation';
import { ModernSystemCourseDetailPage } from '@/screens/ModernSystemCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <ModernSystemCourseDetailPage
      courseId={params.id}
      onNavigateToList={() => router.push('/courses/specialized/modern-system')}
    />
  );
}
