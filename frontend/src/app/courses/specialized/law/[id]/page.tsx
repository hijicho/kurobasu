'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LawCourseDetailPage } from '@/screens/LawCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <LawCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
