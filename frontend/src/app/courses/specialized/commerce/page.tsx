'use client';

import { useRouter } from 'next/navigation';
import { CommerceCoursesListPage } from '@/screens/CommerceCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <CommerceCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/commerce/${id}`)}
    />
  );
}
