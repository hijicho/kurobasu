'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GeneralEducationDetailPage } from '@/screens/GeneralEducationDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <GeneralEducationDetailPage
      courseId={params.id}
      isAuthenticated={isAuthenticated}
      onNavigateToList={() => router.push('/courses/general-education')}
    />
  );
}
