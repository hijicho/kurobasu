'use client';

import { useParams } from 'next/navigation';
import { EconomicsCourseDetailPage } from '@/screens/EconomicsCourseDetailPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  return <EconomicsCourseDetailPage courseId={params.id} />;
}
