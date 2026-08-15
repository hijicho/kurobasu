'use client';

import { useParams, useRouter } from 'next/navigation';
import { CommerceCourseDetailPage } from '@/screens/CommerceCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <CommerceCourseDetailPage
      courseId={params.id}
      onNavigateToList={() => router.push('/courses/specialized/commerce')}
    />
  );
}
