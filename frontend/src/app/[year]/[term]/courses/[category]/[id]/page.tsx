'use client';

import { notFound, useParams, useRouter } from 'next/navigation';
import { ApiCourseDetailPage } from '@/screens/ApiCourseDetailPage';
import {
  categoryNames,
  isValidPublicTerm,
  parsePublicYear,
  publicCategoryPath,
  publicTopPath,
} from '@/lib/public-routing';

const timetableCategories = new Set(['general-education']);

export default function Page() {
  const params = useParams<{ year: string; term: string; category: string; id: string }>();
  const router = useRouter();
  const academicYear = parsePublicYear(params.year);
  const offeringId = Number(params.id);

  if (!academicYear || !isValidPublicTerm(params.term) || !Number.isInteger(offeringId)) {
    notFound();
  }

  return (
    <ApiCourseDetailPage
      offeringId={offeringId}
      categoryName={categoryNames[params.category] ?? params.category}
      usesTimetable={timetableCategories.has(params.category)}
      topHref={publicTopPath(academicYear, params.term)}
      onNavigateToList={() => router.push(publicCategoryPath(academicYear, params.term, params.category))}
    />
  );
}
