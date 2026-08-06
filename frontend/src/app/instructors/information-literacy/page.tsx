'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { InstructorListPage } from '@/screens/InstructorListPage';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <InstructorListPage
      isAuthenticated={isAuthenticated}
      onInstructorClick={(id) => router.push(`/instructors/information-literacy/${id}`)}
    />
  );
}
