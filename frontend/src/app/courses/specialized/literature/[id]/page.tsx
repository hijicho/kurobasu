'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LiteratureCourseDetailPage } from '@/screens/LiteratureCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <LiteratureCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
