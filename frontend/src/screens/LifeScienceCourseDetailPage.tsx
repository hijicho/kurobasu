import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface LifeScienceCourseDetailPageProps {
  courseId: string;
  isAuthenticated?: boolean;
}

export function LifeScienceCourseDetailPage({ courseId, isAuthenticated = false }: LifeScienceCourseDetailPageProps) {
  // 生活科学部の科目詳細データ
  const courseDetails: Record<string, {
    name: string;
    instructor: string;
    evaluationCriteria: string;
    testAllowance: string;
    pros: string[];
    cons: string[];
    other: string[];
  }> = {
    'basic-cell-biology-kim': {
      name: '基礎細胞生物学',
      instructor: '金東浩',
      evaluationCriteria: '出席点あり, 期末テスト',
      testAllowance: '持ち込みなし',
      pros: [
        '先生が優しい',
        'ピ逃げできる',
        'テストの救済措置がある',
      ],
      cons: [
        '説明が分かりにくい',
        '高校で生物をやっていない人にはきつい',
        'グループワークがめんどい',
      ],
      other: [],
    },
    'social-policy-kakita': {
      name: '社会政策学',
      instructor: '垣田裕介',
      evaluationCriteria: '期末テスト, 毎回の課題',
      testAllowance: '持ち込みなし',
      pros: [
        '授業がとにかくおもしろいしためになる。受ける価値がある授業だと思う。',
      ],
      cons: [
        'ない',
      ],
      other: [
        'フィールドワークの時間に外でだるまさんが転んだをした。',
      ],
    },
    'welfare-system1-onishi': {
      name: '福祉システム学1',
      instructor: '大西次郎',
      evaluationCriteria: '期末レポート, 授業での発言回数',
      testAllowance: '(記載なし)',
      pros: [
        'パソコンとか開いててもなんも言われない',
      ],
      cons: [
        '授業内発言60%と多くを占めるのに授業中に発言しないと評価されない。挙手制でグループ(4~7人)のうち1,2人しか回って来ないため、評価されるのは自分から発言できる積極的な子しかいない。グループで「誰が発言する？」みたいな雰囲気になったとき、傲慢にも発言するか、他人に譲って優しさを見せるかみたいな心理戦になるからしんどい。',
      ],
      other: [
        '優しくておとなしい子はグイグイ行く子に発言権譲ってしまうと思うので本当にとるのオススメしません。',
      ],
    },
    'clinical-psychology-intro-ogata': {
      name: '臨床心理学概論',
      instructor: '緒方康介',
      evaluationCriteria: '出席点あり, 小テスト',
      testAllowance: '持ち込みなし',
      pros: [
        '授業がおもしろい。',
      ],
      cons: [
        'テストが過去問の情報がないとちょっとしんどい。',
      ],
      other: [],
    },
    'social-welfare-principles-tokoro': {
      name: '社会福祉原理論',
      instructor: '所道彦',
      evaluationCriteria: '期末テスト, 小レポート',
      testAllowance: '持ち込みなし',
      pros: [
        '先生の笑顔に癒される',
      ],
      cons: [
        '眠くなってしまう',
      ],
      other: [
        '期末テストは暗記が必要とかではない。',
      ],
    },
  };

  const course = courseDetails[courseId];

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header isAuthenticated={isAuthenticated} />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
          <p className="text-center text-gray-500">科目が見つかりませんでした</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '生活科学部科目一覧', href: '/courses/specialized/human-life' },
          { label: course.name },
        ]} />

        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* ヘッダー情報 */}
          <div className="mb-6 md:mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl md:text-3xl mb-3">{course.name}</h1>
            <p className="text-sm md:text-base text-gray-600">担当教員：{course.instructor}</p>
          </div>

          {/* 基本情報 */}
          <div className="space-y-6 md:space-y-8">
            {/* 評価基準 */}
            <div>
              <h2 className="text-lg md:text-xl mb-3 pb-2 border-b border-gray-200">評価基準</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{course.evaluationCriteria}</p>
            </div>

            {/* テスト持ち込み */}
            <div>
              <h2 className="text-lg md:text-xl mb-3 pb-2 border-b border-gray-200">テスト持ち込み</h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{course.testAllowance}</p>
            </div>

            {/* 良かったところ */}
            <div>
              <h2 className="text-lg md:text-xl mb-3 pb-2 border-b border-gray-200">良かったところ</h2>
              {course.pros.length > 0 ? (
                <ul className="space-y-2">
                  {course.pros.map((pro, index) => (
                    <li key={index} className="text-sm md:text-base text-gray-700 leading-relaxed flex">
                      <span className="mr-2">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm md:text-base text-gray-500">(記載なし)</p>
              )}
            </div>

            {/* 悪かったところ */}
            <div>
              <h2 className="text-lg md:text-xl mb-3 pb-2 border-b border-gray-200">悪かったところ</h2>
              {course.cons.length > 0 ? (
                <ul className="space-y-2">
                  {course.cons.map((con, index) => (
                    <li key={index} className="text-sm md:text-base text-gray-700 leading-relaxed flex">
                      <span className="mr-2">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm md:text-base text-gray-500">(記載なし)</p>
              )}
            </div>

            {/* その他 */}
            <div>
              <h2 className="text-lg md:text-xl mb-3 pb-2 border-b border-gray-200">その他</h2>
              {course.other.length > 0 ? (
                <ul className="space-y-2">
                  {course.other.map((item, index) => (
                    <li key={index} className="text-sm md:text-base text-gray-700 leading-relaxed flex">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm md:text-base text-gray-500">(記載なし)</p>
              )}
            </div>
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="text-center">
          <a
            href="/courses/specialized/human-life"
            className="inline-block text-sm md:text-base text-[#2B4DCA] hover:underline"
          >
            ← 生活科学部科目一覧に戻る
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
