'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EconomicsCourseDetailPage } from '@/screens/EconomicsCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <EconomicsCourseDetailPage courseId={params.id} isAuthenticated={isAuthenticated} />;
}
