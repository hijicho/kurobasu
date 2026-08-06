'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { EnglishInstructorDetailPage } from '@/screens/EnglishInstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <EnglishInstructorDetailPage instructorId={params.id} isAuthenticated={isAuthenticated} />;
}
