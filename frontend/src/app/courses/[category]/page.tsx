import CategoryPageClient from './CategoryPageClient'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const categoryNames: Record<string, string> = {
    'general': '般教（一般教育科目）',
    'second-language': '第二外国語',
    'foundation': '基礎教育科目',
    'first-year-seminar': '初年次ゼミナール',
    'health-sports': '健康・スポーツ科学',
    'english': '英語',
    'specialized': '専門科目',
  }

  return {
    title: `${categoryNames[category] || 'カテゴリ'} - クロバス`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  return <CategoryPageClient category={category} />
}
