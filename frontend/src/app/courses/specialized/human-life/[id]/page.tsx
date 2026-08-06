'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LifeScienceCourseDetailPage } from '@/screens/LifeScienceCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <LifeScienceCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
