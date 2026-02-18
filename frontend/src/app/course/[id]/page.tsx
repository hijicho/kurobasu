import CourseDetailPageClient from './CourseDetailPageClient'

export const metadata = {
  title: '授業詳細 - クロバス',
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CourseDetailPageClient courseId={id} />
}
