'use client';

import { useRouter } from 'next/navigation';
import { JapaneseInstructorListPage } from '@/screens/JapaneseInstructorListPage';

export default function Page() {
  const router = useRouter();
  return (
    <JapaneseInstructorListPage
      onInstructorClick={(id) => router.push(`/instructors/english-japanese/${id}`)}
    />
  );
}
