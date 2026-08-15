'use client';

import { useRouter } from 'next/navigation';
import { InstructorListPage } from '@/screens/InstructorListPage';

export default function Page() {
  const router = useRouter();
  return (
    <InstructorListPage
      onInstructorClick={(id) => router.push(`/instructors/information-literacy/${id}`)}
    />
  );
}
