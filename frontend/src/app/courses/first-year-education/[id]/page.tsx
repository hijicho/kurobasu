'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FirstYearEducationDetailPage } from '@/screens/FirstYearEducationDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <FirstYearEducationDetailPage
      courseId={params.id}
      isAuthenticated={isAuthenticated}
      onNavigateToList={() => router.push('/courses/first-year-education')}
    />
  );
}
