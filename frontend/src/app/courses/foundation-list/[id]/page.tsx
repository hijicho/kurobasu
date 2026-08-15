'use client';

import { useParams } from 'next/navigation';
import { FoundationCourseDetailPage } from '@/screens/FoundationCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <FoundationCourseDetailPage courseId={params.id} />;
}
