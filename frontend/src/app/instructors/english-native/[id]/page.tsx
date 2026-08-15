'use client';

import { useParams } from 'next/navigation';
import { EnglishInstructorDetailPage } from '@/screens/EnglishInstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <EnglishInstructorDetailPage instructorId={params.id} />;
}
