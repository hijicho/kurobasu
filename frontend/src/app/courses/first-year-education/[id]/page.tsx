'use client';

import { useParams, useRouter } from 'next/navigation';
import { FirstYearEducationDetailPage } from '@/screens/FirstYearEducationDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <FirstYearEducationDetailPage
      courseId={params.id}
      onNavigateToList={() => router.push('/courses/first-year-education')}
    />
  );
}
