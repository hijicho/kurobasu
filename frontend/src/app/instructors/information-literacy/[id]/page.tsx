'use client';

import { useParams } from 'next/navigation';
import { InstructorDetailPage } from '@/screens/InstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <InstructorDetailPage instructorId={params.id} />;
}
