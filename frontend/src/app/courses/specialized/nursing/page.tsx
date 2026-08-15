'use client';

import { useRouter } from 'next/navigation';
import { NursingCoursesListPage } from '@/screens/NursingCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <NursingCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/nursing/${id}`)}
    />
  );
}
