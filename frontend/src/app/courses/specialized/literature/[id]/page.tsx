'use client';

import { useParams } from 'next/navigation';
import { LiteratureCourseDetailPage } from '@/screens/LiteratureCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <LiteratureCourseDetailPage courseId={params.id} />;
}
