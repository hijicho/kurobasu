'use client';

import { useParams } from 'next/navigation';
import { NursingCourseDetailPage } from '@/screens/NursingCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <NursingCourseDetailPage courseId={params.id} />;
}
