'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FirstYearEducationListPage } from '@/screens/FirstYearEducationListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <FirstYearEducationListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/first-year-education/${id}`)}
      onNavigateBack={() => router.push('/')}
    />
  );
}
