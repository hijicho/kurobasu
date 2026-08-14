'use client';

import { useParams, useRouter } from 'next/navigation';
import { ApiCourseDetailPage } from '@/screens/ApiCourseDetailPage';

const categoryNames: Record<string, string> = {
  science: 'Science',
  mathematics: 'Mathematics',
  languages: 'Languages',
  arts: 'Arts',
  general: '総合教養科目（般教）',
  'second-language': '第二外国語',
  foundation: '基礎教育科目',
  'first-year-seminar': '初年次教育科目（初ゼミ）',
  'health-sports': '健康・スポーツ科学',
  english: '英語',
  specialized: '専門科目',
};

export default function Page() {
  const params = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const offeringId = Number(params.id);

  return (
    <ApiCourseDetailPage
      offeringId={offeringId}
      categoryName={categoryNames[params.category] ?? params.category}
      onNavigateToList={() => router.push(`/courses/${params.category}`)}
    />
  );
}
