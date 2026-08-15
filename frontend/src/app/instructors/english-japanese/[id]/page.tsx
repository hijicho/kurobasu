'use client';

import { useParams } from 'next/navigation';
import { JapaneseInstructorDetailPage } from '@/screens/JapaneseInstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <JapaneseInstructorDetailPage instructorId={params.id} />;
}
