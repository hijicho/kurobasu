'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MedicalRehabCourseDetailPage } from '@/screens/MedicalRehabCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <MedicalRehabCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
