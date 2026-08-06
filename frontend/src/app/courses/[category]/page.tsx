'use client';

import { useParams, useRouter } from 'next/navigation';
import { CategoryPage } from '@/screens/CategoryPage';

const categoryNames: Record<string, string> = {
  general: '総合教養科目（般教）',
  'second-language': '第二外国語',
  foundation: '基礎教育科目',
  'first-year-seminar': '初年次教育科目（初ゼミ）',
  'health-sports': '健康・スポーツ科学',
  english: '英語',
  specialized: '専門科目',
};

export default function Page() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const categoryId = params.category;

  return (
    <CategoryPage
      categoryName={categoryNames[categoryId] ?? categoryId}
      categoryId={categoryId}
      onNavigateBack={() => router.push('/')}
    />
  );
}
