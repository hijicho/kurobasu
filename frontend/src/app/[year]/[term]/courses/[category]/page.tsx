'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { CategoryPage } from '@/screens/CategoryPage';
import {
  categoryNames,
  isValidPublicTerm,
  parsePublicYear,
  publicOfferingPath,
  publicTopPath,
} from '@/lib/public-routing';

export default function Page() {
  const params = useParams<{ year: string; term: string; category: string }>();
  const router = useRouter();
  const academicYear = parsePublicYear(params.year);
  const categoryId = params.category;

  if (!academicYear || !isValidPublicTerm(params.term)) {
    notFound();
  }

  return (
    <CategoryPage
      categoryName={categoryNames[categoryId] ?? categoryId}
      categoryId={categoryId}
      academicYear={academicYear}
      term={params.term}
      onNavigateBack={() => router.push(publicTopPath(academicYear, params.term))}
      onCourseClick={(id) => router.push(publicOfferingPath(academicYear, params.term, categoryId, id))}
    />
  );
}
