'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { NursingCourseDetailPage } from '@/screens/NursingCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <NursingCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
