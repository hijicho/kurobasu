'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { InstructorDetailPage } from '@/screens/InstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <InstructorDetailPage instructorId={params.id} isAuthenticated={isAuthenticated} />;
}
