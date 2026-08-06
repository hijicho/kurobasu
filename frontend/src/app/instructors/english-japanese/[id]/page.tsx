'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { JapaneseInstructorDetailPage } from '@/screens/JapaneseInstructorDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  return <JapaneseInstructorDetailPage instructorId={params.id} isAuthenticated={isAuthenticated} />;
}
