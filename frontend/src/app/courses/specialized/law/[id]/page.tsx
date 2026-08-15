'use client';

import { useParams } from 'next/navigation';
import { LawCourseDetailPage } from '@/screens/LawCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <LawCourseDetailPage courseId={params.id} />;
}
