'use client';

import { useRouter } from 'next/navigation';
import { TimetableExamplesPage } from '@/screens/TimetableExamplesPage';

export default function Page() {
  const router = useRouter();
  return <TimetableExamplesPage onNavigateBack={() => router.push('/')} />;
}
