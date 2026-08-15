'use client';

import { useParams } from 'next/navigation';
import { LifeScienceCourseDetailPage } from '@/screens/LifeScienceCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <LifeScienceCourseDetailPage courseId={params.id} />;
}
