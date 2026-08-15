'use client';

import { useParams } from 'next/navigation';
import { EngineeringCourseDetailPage } from '@/screens/EngineeringCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <EngineeringCourseDetailPage courseId={params.id} />;
}
