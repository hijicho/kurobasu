'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EngineeringCourseDetailPage } from '@/screens/EngineeringCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <EngineeringCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
