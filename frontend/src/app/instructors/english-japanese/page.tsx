'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { JapaneseInstructorListPage } from '@/screens/JapaneseInstructorListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <JapaneseInstructorListPage
      isAuthenticated={isAuthenticated}
      onInstructorClick={(id) => router.push(`/instructors/english-japanese/${id}`)}
    />
  );
}
