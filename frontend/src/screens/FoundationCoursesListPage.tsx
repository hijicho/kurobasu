import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { useState } from 'react';

interface FoundationCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

interface CourseInstructor {
  instructor: string;
  id: string;
  reviewCount: number;
}

interface CourseGroup {
  name: string;
  instructors: CourseInstructor[];
}

export function FoundationCoursesListPage({ isAuthenticated = false, onCourseClick }: FoundationCoursesListPageProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // 基礎教育科目データ（カテゴリ別）
  const categories = [
    {
      name: '数学',
      courses: [
        { name: '解析Ⅰ', instructors: [{ instructor: '山名', id: 'kaiseki-1-yamana', reviewCount: 2 }] },
        { name: '基礎数学A', instructors: [
          { instructor: '佐野', id: 'basic-math-a-sano', reviewCount: 3 },
          { instructor: '壁谷', id: 'basic-math-a-kabetani', reviewCount: 2 },
          { instructor: '宮地', id: 'basic-math-a-miyaji', reviewCount: 22 },
          { instructor: '尾角', id: 'basic-math-a-osumi', reviewCount: 4 }
        ]},
        { name: '常微分方程式', instructors: [
          { instructor: '尾角', id: 'differential-equations-osumi', reviewCount: 3 },
          { instructor: '濱本', id: 'differential-equations-hamamoto', reviewCount: 2 },
          { instructor: '谷川', id: 'differential-equations-tanigawa', reviewCount: 13 }
        ]},
        { name: '線形代数1', instructors: [
          { instructor: '佐藤', id: 'linear-algebra-1-sato', reviewCount: 5 },
          { instructor: '佐野', id: 'linear-algebra-1-sano', reviewCount: 2 },
          { instructor: '吉冨', id: 'linear-algebra-1-yoshitomi', reviewCount: 11 },
          { instructor: '宮地', id: 'linear-algebra-1-miyaji', reviewCount: 3 },
          { instructor: '山名', id: 'linear-algebra-1-yamana', reviewCount: 5 },
          { instructor: '川添', id: 'linear-algebra-1-kawazoe', reviewCount: 3 },
          { instructor: '松野', id: 'linear-algebra-1-matsuno', reviewCount: 6 },
          { instructor: '源', id: 'linear-algebra-1-minamoto', reviewCount: 3 },
          { instructor: '神田', id: 'linear-algebra-1-kanda', reviewCount: 5 }
        ]},
        { name: '統計学基礎1', instructors: [
          { instructor: '(記載なし)', id: 'statistics-basic-1-unknown', reviewCount: 2 },
          { instructor: '田中', id: 'statistics-basic-1-tanaka', reviewCount: 6 },
          { instructor: '綿森', id: 'statistics-basic-1-watamori', reviewCount: 10 }
        ]},
        { name: '微積分1A', instructors: [
          { instructor: '中野', id: 'calculus-1a-nakano', reviewCount: 5 },
          { instructor: '古澤', id: 'calculus-1a-furusawa', reviewCount: 3 },
          { instructor: '大須賀', id: 'calculus-1a-osuga', reviewCount: 2 },
          { instructor: '山名', id: 'calculus-1a-yamana', reviewCount: 4 },
          { instructor: '枡田', id: 'calculus-1a-masuda', reviewCount: 9 },
          { instructor: '田村', id: 'calculus-1a-tamura', reviewCount: 3 },
          { instructor: '砂川', id: 'calculus-1a-sunagawa', reviewCount: 2 },
          { instructor: '高松', id: 'calculus-1a-takamatsu', reviewCount: 5 },
          { instructor: '高橋', id: 'calculus-1a-takahashi', reviewCount: 3 }
        ]},
        { name: '微積分1B', instructors: [
          { instructor: '山口', id: 'calculus-1b-yamaguchi', reviewCount: 5 }
        ]},
        { name: 'ベクトル解析', instructors: [
          { instructor: '壁谷', id: 'vector-analysis-kabetani', reviewCount: 2 },
          { instructor: '菅', id: 'vector-analysis-suga', reviewCount: 9 }
        ]}
      ] as CourseGroup[]
    },
    {
      name: '化学',
      courses: [
        { name: '基礎化学実験', instructors: [
          { instructor: '毎回別', id: 'basic-chemistry-exp-various', reviewCount: 1 },
          { instructor: '臼杵', id: 'basic-chemistry-exp-usuki', reviewCount: 8 },
          { instructor: '複数人', id: 'basic-chemistry-exp-multiple', reviewCount: 2 }
        ]},
        { name: '基礎有機化学A', instructors: [
          { instructor: '中瀬', id: 'basic-organic-chem-a-nakase', reviewCount: 4 },
          { instructor: '堀川', id: 'basic-organic-chem-a-horikawa', reviewCount: 3 },
          { instructor: '藤岡', id: 'basic-organic-chem-a-fujioka', reviewCount: 3 }
        ]},
        { name: '基礎無機・分析化学A', instructors: [
          { instructor: '中沢', id: 'basic-inorganic-analytical-chem-a-nakazawa', reviewCount: 4 },
          { instructor: '道志', id: 'basic-inorganic-analytical-chem-a-doshi', reviewCount: 3 }
        ]},
        { name: '基礎無機・物理化学', instructors: [
          { instructor: '佐藤', id: 'basic-inorganic-physical-chem-sato', reviewCount: 3 },
          { instructor: '谷口', id: 'basic-inorganic-physical-chem-taniguchi', reviewCount: 4 },
          { instructor: '陶山', id: 'basic-inorganic-physical-chem-suyama', reviewCount: 8 }
        ]},
        { name: '基礎物理化学A', instructors: [
          { instructor: '手木', id: 'basic-physical-chem-a-teki', reviewCount: 5 },
          { instructor: '池田', id: 'basic-physical-chem-a-ikeda', reviewCount: 5 }
        ]}
      ] as CourseGroup[]
    },
    {
      name: '地学',
      courses: [
        { name: '地球学基礎A', instructors: [
          { instructor: '瀬戸 / 柵山 / 足立', id: 'earth-science-basic-a-seto', reviewCount: 2 }
        ]},
        { name: '地球学入門', instructors: [
          { instructor: '山口', id: 'earth-science-intro-yamaguchi', reviewCount: 3 },
          { instructor: '桑原', id: 'earth-science-intro-kuwahara', reviewCount: 4 }
        ]}
      ] as CourseGroup[]
    },
    {
      name: '物理学',
      courses: [
        { name: '応用物理学実験', instructors: [
          { instructor: '田口', id: 'applied-physics-exp-taguchi', reviewCount: 2 }
        ]},
        { name: '基礎力学1A', instructors: [
          { instructor: '安井', id: 'basic-mechanics-1a-yasui', reviewCount: 8 },
          { instructor: '有馬', id: 'basic-mechanics-1a-arima', reviewCount: 11 }
        ]},
        { name: '基礎力学B1', instructors: [
          { instructor: '譚', id: 'basic-mechanics-b1-tan', reviewCount: 3 },
          { instructor: '魚住', id: 'basic-mechanics-b1-uozumi', reviewCount: 10 }
        ]},
        { name: '基礎力学B3', instructors: [
          { instructor: '原田', id: 'basic-mechanics-b3-harada', reviewCount: 2 }
        ]},
        { name: '基礎力学C', instructors: [
          { instructor: '吉野', id: 'basic-mechanics-c-yoshino', reviewCount: 3 },
          { instructor: '星野', id: 'basic-mechanics-c-hoshino', reviewCount: 2 },
          { instructor: '濱端', id: 'basic-mechanics-c-hamahata', reviewCount: 3 }
        ]},
        { name: '基礎熱力学', instructors: [
          { instructor: '吉田', id: 'basic-thermodynamics-yoshida', reviewCount: 2 },
          { instructor: '坪田', id: 'basic-thermodynamics-tsubota', reviewCount: 3 },
          { instructor: '松野', id: 'basic-thermodynamics-matsuno', reviewCount: 3 },
          { instructor: '石原', id: 'basic-thermodynamics-ishihara', reviewCount: 3 }
        ]},
        { name: '基礎統計力学', instructors: [
          { instructor: '堀田', id: 'basic-statistical-mechanics-hotta', reviewCount: 3 }
        ]},
        { name: '基礎電磁気学C', instructors: [
          { instructor: '大橋', id: 'basic-electromagnetics-c-ohashi', reviewCount: 4 },
          { instructor: '櫻井', id: 'basic-electromagnetics-c-sakurai', reviewCount: 5 },
          { instructor: '濱端', id: 'basic-electromagnetics-c-hamahata', reviewCount: 2 }
        ]},
        { name: '基礎物理学実験1B', instructors: [
          { instructor: '梅澤 / 臼井 / 市川', id: 'basic-physics-exp-1b-umezawa', reviewCount: 3 }
        ]},
        { name: '近代物理学', instructors: [
          { instructor: '阪部', id: 'modern-physics-sakabe', reviewCount: 5 }
        ]},
        { name: '入門物理学1', instructors: [
          { instructor: '大田', id: 'intro-physics-1-ota', reviewCount: 7 }
        ]}
      ] as CourseGroup[]
    },
    {
      name: '生物学',
      courses: [
        { name: '生物学1', instructors: [
          { instructor: '加藤', id: 'biology-1-kato', reviewCount: 6 },
          { instructor: '名波', id: 'biology-1-nanami', reviewCount: 5 },
          { instructor: '名波 / 安房田', id: 'biology-1-nanami-awata', reviewCount: 12 },
          { instructor: '宮崎', id: 'biology-1-miyazaki', reviewCount: 5 },
          { instructor: '寺北', id: 'biology-1-terakita', reviewCount: 0 },
          { instructor: '竹門 / 刀祢', id: 'biology-1-takemon-tone', reviewCount: 2 },
          { instructor: '笠松', id: 'biology-1-kasamatsu', reviewCount: 1 },
          { instructor: '齋藤', id: 'biology-1-saito', reviewCount: 8 }
        ]},
        { name: '生物学実験A', instructors: [
          { instructor: '白石', id: 'biology-exp-a-shiraishi', reviewCount: 3 }
        ]}
      ] as CourseGroup[]
    },
    {
      name: '情報学',
      courses: [
        { name: '人間システムとサスティナビリティ', instructors: [
          { instructor: '(記載なし)', id: 'human-system-sustainability-unknown', reviewCount: 2 }
        ]},
        { name: '情報システムとサステイナビリティ', instructors: [
          { instructor: '(記載なし)', id: 'info-system-sustainability-unknown', reviewCount: 2 }
        ]}
      ] as CourseGroup[]
    }
  ];

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId);
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-4 md:py-6">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '基礎教育科目' },
        ]} />

        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl mb-2">基礎教育科目</h1>
          <p className="text-sm md:text-base text-gray-600">授業名をクリックすると、詳細ページに移動します。</p>
        </div>

        {/* カテゴリ別科目一覧 */}
        <div className="space-y-4 md:space-y-5">
          {categories.map((category, index) => (
            <div key={index}>
              {/* カテゴリ見出し（通常の見出しスタイル） */}
              <div className="mb-2 md:mb-3">
                <h2 className="text-base md:text-lg text-gray-700 font-medium">{category.name}</h2>
              </div>
              
              {/* 科目一覧グリッド（PC3列・スマホ2列） */}
              {category.courses.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {category.courses.map((course, courseIdx) => (
                    <div
                      key={courseIdx}
                      className="bg-white border border-gray-200 rounded-xl p-3 md:p-4"
                    >
                      {/* 授業名 */}
                      <h3 className="text-sm md:text-base text-gray-900 mb-2 md:mb-3">
                        {course.name}
                      </h3>
                      
                      {/* 担当教員ボタン一覧 */}
                      <div className="space-y-1.5 md:space-y-2">
                        {course.instructors.map((inst) => (
                          <button
                            key={inst.id}
                            onClick={() => handleCourseClick(inst.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-xs md:text-sm font-bold ${
                              selectedCourse === inst.id
                                ? 'border-[#2B4DCA] bg-blue-50 text-[#2B4DCA]'
                                : 'border-gray-200 hover:border-[#2B4DCA] hover:bg-blue-50 text-[#2B4DCA]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{inst.instructor}</span>
                              {inst.reviewCount > 0 && (
                                <span className="text-[10px] md:text-xs text-gray-500 flex-shrink-0">
                                  {inst.reviewCount}件
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4">
                  <p className="text-gray-400 text-xs md:text-sm">科目なし</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}