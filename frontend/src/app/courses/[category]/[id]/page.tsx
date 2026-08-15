'use client';

import { useParams, useRouter } from 'next/navigation';
import { ApiCourseDetailPage } from '@/screens/ApiCourseDetailPage';

const categoryNames: Record<string, string> = {
  'general-education': '総合教養科目（般教）',
  'second-language': '第二外国語',
  'foundation-list': '基礎教育科目',
  'first-year-education': '初年次教育科目（初ゼミ）',
  'health-sports': '健康・スポーツ科学',
  'information-literacy': '情報リテラシー科目',
  'english-japanese': '外国語科目(英語必修)-日本語教師',
  'english-native': '外国語科目(英語必修)-英語教師',
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
