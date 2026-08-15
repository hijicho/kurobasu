'use client';

import { useParams } from 'next/navigation';
import { ScienceCourseDetailPage } from '@/screens/ScienceCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <ScienceCourseDetailPage courseId={params.id} />;
}
