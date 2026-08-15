import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { ReviewSections } from '../components/course-detail/ReviewSections';
import { economicsCourses } from '../data/economicsCourses';

interface EconomicsCourseDetailPageProps {
  courseId?: string;
}

interface CourseData {
  name: string;
  instructor: string;
  evaluationCriteria: string;
  allowedMaterials: string;
  pros: string[];
  cons: string[];
  others: string[];
}

export function EconomicsCourseDetailPage({ courseId = 'econometrics-1-kano' }: EconomicsCourseDetailPageProps) {

  const getCourseData = (id: string): CourseData => {
    // Use the canonical economicsCourses data exported from src/data
    const courses = economicsCourses as Record<string, CourseData>;

    // If id matches a map key, return it
    if (courses[id]) return courses[id];

    // Otherwise try several fallback matching strategies to handle
    // - list ids generated from course name (slugified)
    // - direct name match (decoded)
    // - normalized substring match (e.g. '計量経済学' vs '計量経済学1')
    const slugify = (s: string) => encodeURIComponent((s ?? '').trim());

    // Try slugified name match first (existing behavior)
    for (const key of Object.keys(courses)) {
      const c = courses[key];
      if (slugify(c.name) === id) return c;
    }

    // Try decoded direct name match and a relaxed normalized match
    try {
      const decoded = decodeURIComponent(id);
      const normalize = (s: string) => (s ?? '').replace(/[0-9０-９]/g, '').trim().toLowerCase();

      for (const key of Object.keys(courses)) {
        const c = courses[key];
        // exact decoded name match
        if (c.name === decoded) return c;

        // normalized equality (remove digits like '1' that may differ between list/name)
        if (normalize(c.name) === normalize(decoded)) return c;

        // substring match in either direction (covers short/long name variants)
        const nCourse = normalize(c.name);
        const nDecoded = normalize(decoded);
        if (nCourse && nDecoded && (nCourse.includes(nDecoded) || nDecoded.includes(nCourse))) return c;
      }
    } catch (e) {
      // ignore decode errors and fall through to default
    }

    // Fallback to default
    return courses['econometrics-1-kano'];
  };

  const courseData = getCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '経済学部科目一覧', href: '/courses/economics' },
          { label: courseData.name },
        ]} />

        {/* 科目名・教員名 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">{courseData.name}</h1>
          <p className="text-sm md:text-base text-gray-600">担当教員：{courseData.instructor}</p>
        </div>

        {/* 評価基準・持ち込み */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">評価基準</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.evaluationCriteria}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">テスト持ち込み</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.allowedMaterials}</p>
            </div>
          </div>
        </div>

        <ReviewSections pros={courseData.pros} cons={courseData.cons} others={courseData.others} />
      </main>

      <Footer />
    </div>
  );
}