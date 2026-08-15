'use client';

import { notFound, useParams } from 'next/navigation';
import { TopPage } from '@/screens/TopPage';
import { isValidPublicTerm, parsePublicYear } from '@/lib/public-routing';

export default function Page() {
  const params = useParams<{ year: string; term: string }>();
  const academicYear = parsePublicYear(params.year);

  if (!academicYear || !isValidPublicTerm(params.term)) {
    notFound();
  }

  return <TopPage academicYear={academicYear} term={params.term} />;
}
