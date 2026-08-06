'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { GeneralEducationListPage } from '@/screens/GeneralEducationListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <GeneralEducationListPage
      isAuthenticated={isAuthenticated}
      onCourseClick={(id) => router.push(`/courses/general-education/${id}`)}
      onNavigateBack={() => router.push('/')}
    />
  );
}
