'use client';

import { useRouter } from 'next/navigation';
import { EnglishInstructorListPage } from '@/screens/EnglishInstructorListPage';

export default function Page() {
  const router = useRouter();
  return (
    <EnglishInstructorListPage
      onInstructorClick={(id) => router.push(`/instructors/english-native/${id}`)}
    />
  );
}
