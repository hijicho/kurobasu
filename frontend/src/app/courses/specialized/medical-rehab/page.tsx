'use client';

import { useRouter } from 'next/navigation';
import { MedicalRehabCoursesListPage } from '@/screens/MedicalRehabCoursesListPage';

export default function Page() {
  const router = useRouter();
  return (
    <MedicalRehabCoursesListPage
      onCourseClick={(id) => router.push(`/courses/specialized/medical-rehab/${id}`)}
    />
  );
}
