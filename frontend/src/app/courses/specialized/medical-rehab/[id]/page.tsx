'use client';

import { useParams } from 'next/navigation';
import { MedicalRehabCourseDetailPage } from '@/screens/MedicalRehabCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <MedicalRehabCourseDetailPage courseId={params.id} />;
}
