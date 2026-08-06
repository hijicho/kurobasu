'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FoundationCourseDetailPage } from '@/screens/FoundationCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <FoundationCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
