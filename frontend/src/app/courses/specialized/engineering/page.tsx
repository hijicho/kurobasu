'use client';

import { useRouter } from 'next/navigation';
import { EngineeringCoursesListPage } from '@/screens/EngineeringCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <EngineeringCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/engineering/${id}`)}
    />
  );
}
