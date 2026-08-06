'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EnglishInstructorListPage } from '@/screens/EnglishInstructorListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <EnglishInstructorListPage
      isAuthenticated={isAuthenticated}
      onInstructorClick={(id) => router.push(`/instructors/english-native/${id}`)}
    />
  );
}
