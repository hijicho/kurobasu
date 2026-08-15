'use client';

import { useRouter } from 'next/navigation';
import { FirstYearEducationListPage } from '@/screens/FirstYearEducationListPage';

export default function Page() {
  const router = useRouter();
  return (
    <FirstYearEducationListPage
      onCourseClick={(id) => router.push(`/courses/first-year-education/${id}`)}
      onNavigateBack={() => router.push('/')}
    />
  );
}
