import { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface EngineeringCoursesListPageProps {
  isAuthenticated?: boolean;
  onCourseClick?: (courseId: string) => void;
}

export function EngineeringCoursesListPage({ isAuthenticated = false, onCourseClick }: EngineeringCoursesListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 工学部の科目データ
  const courses = [
    { id: 'communication-systems-yamada', name: '通信システム', instructor: '山田' },
    { id: 'mechanical-dynamics1-kawai', name: '機械力学1', instructor: '川合' },
    { id: 'polymer-chemistry2-harada', name: '高分子化学2', instructor: '原田' },
    { id: 'urban-planning1-kana', name: '都市計画1', instructor: '嘉名' },
    { id: 'control-engineering1-hara', name: '制御工学1', instructor: '原' },
    { id: 'physical-chemistry1a-inoue-higuchi', name: '物理化学ⅠA', instructor: '井上 / 横口' },
    { id: 'urban-environmental-studies-komaki-mizutani-endo', name: '都市環境学', instructor: '小牧 / 水谷 / 遠藤' },
    { id: 'electrical-system-experiment1-sugitani', name: '電気電子システム工学実験1', instructor: '杉谷' },
    { id: 'urban-studies-intro-endo-yonezawa', name: '都市学入門', instructor: '遠藤 / 米澤' },
    { id: 'aerospace-experiment-mori', name: '航空宇宙工学実験', instructor: '森' },
    { id: 'bio-organic-chemistry-higashi', name: '生物有機化学', instructor: '東' },
    { id: 'engineering-ethics-nomura', name: '工学倫理', instructor: '野村' },
    { id: 'engineering-ethics-omnibus-nomura', name: '工学倫理', instructor: 'オムニバス / 野村' },
    { id: 'material-physical-chemistry-basics-ono', name: '材料物理化学基礎', instructor: '大野' },
    { id: 'mechanical-material-mechanics1-yamasaki', name: '機械材料力学1', instructor: '山崎' },
    { id: 'optical-information-engineering-miyazaki', name: '光情報工学', instructor: '宮崎' },
    { id: 'electrical-system-basic-experiment-tsujioka-hara-morita', name: '電気電子システム工学基礎実験', instructor: '辻岡 / 原 / 森田' },
    { id: 'elementary-crystallography-kimura', name: '初頭結晶学', instructor: '木村' },
    { id: 'programming-practice-chujo-kakegake', name: 'プログラミング演習', instructor: '中條 / 角掛' },
    { id: 'basic-fluid-mechanics-shigematsu', name: '基礎流体力学', instructor: '重松' },
    { id: 'inorganic-chemistry-intro-hayashi-tokudome', name: '無機化学序論', instructor: '林 / 徳留' },
    { id: 'inorganic-materials-chemistry-sakuta', name: '無機材料化学', instructor: '作田' },
    { id: 'electrical-measurement-sanada', name: '電気電子計測', instructor: '真田' },
    { id: 'analytical-chemistry-a-hisamoto', name: '分析化学A', instructor: '久本' },
    { id: 'practical-biochemical-engineering-igarashi', name: '実践生物化学工学', instructor: '五十嵐' },
    { id: 'organic-chemistry1a-yagi-maeda', name: '有機化学1A', instructor: '八木 / 前田' },
    { id: 'perceptual-information-processing-iwamura', name: '知覚情報処理', instructor: '岩村' },
    { id: 'electromagnetics1b-kubota', name: '電磁気学1B', instructor: '久保田' },
    { id: 'electrical-circuit-theory-shirafuji', name: '電気回路学', instructor: '白藤' },
    { id: 'career-design-engineers-nomura', name: 'エンジニアのためのキャリアデザイン', instructor: '野村' },
    { id: 'organometallic-chemistry-ikeda', name: '有機金属化学', instructor: '池田' },
    { id: 'structural-analysis-practice-matsui', name: '構造解析演習', instructor: '松井' },
    { id: 'material-design-control-takigawa', name: '材料設計・制御', instructor: '瀧川' },
    { id: 'physical-chemistry-practice2-horiuchi', name: '物理化学演習2', instructor: '堀内' },
    { id: 'applied-chemistry-experiment2-endo', name: '応用化学実験2', instructor: '遠藤' },
    { id: 'environmental-chemistry-sadanaga', name: '環境化学', instructor: '定永' },
    { id: 'organic-chemistry-practice2-kodama', name: '有機化学演習2', instructor: '小玉' },
    { id: 'career-design-management-nomura', name: 'エンジニアのためのキャリアデザイン／経営論', instructor: '野村' },
    { id: 'electrical-circuit-practice-tanaka', name: '電気回路学演習', instructor: '田中' },
    { id: 'molecular-biology-nakanishi', name: '分子生物学', instructor: '中西' },
    { id: 'drafting-design-practice-takagi-yusa', name: '製図設計演習', instructor: '高木 / 遊佐' },
    { id: 'aerospace-basics1-faculty', name: '航空宇宙工学基礎1', instructor: '航空宇宙工学科所属の先生方' },
    { id: 'computer-system-takubo', name: 'コンピュータシステム', instructor: '田窪' },
    { id: 'mechanical-fluid-mechanics1-wakimoto-omori', name: '機械流体力学1', instructor: '脇本 / 大森' },
    { id: 'urban-engineering-science-basics-kakegake-yamada-chujo', name: '都市工学のための科学基礎', instructor: '角掛 / 山田 / 中條' },
    { id: 'electronic-physical-engineering-intro1-omnibus', name: '電子物理工学概論1', instructor: 'オムニバス' },
    { id: 'biotechnology-intro-tachibana', name: 'バイオテクノロジー概論', instructor: '立花' },
    { id: 'electrical-circuit1-sanada', name: '電気回路1', instructor: '真田' },
    { id: 'information-theory-b-shu', name: '情報理論B', instructor: '周' },
    { id: 'urban-engineering-mechanics-basics-kakegake-yamada-chujo', name: '都市工学のための力学基礎', instructor: '角掛 / 山田 / 中條' },
    { id: 'system-optimization-morisawa', name: 'システム最適化', instructor: '森澤' },
    { id: 'power-engineering-ishigame', name: '電力工学', instructor: '石亀' },
    { id: 'mechanical-thermodynamics1-segawa', name: '機械熱力学1', instructor: '瀬川' },
    { id: 'physical-chemistry2a-shiigi', name: '物理化学2A', instructor: '椎木' },
    { id: 'discrete-mathematics-uno', name: '離散数学', instructor: '宇野' },
    { id: 'electromagnetic-wave-engineering-kubota', name: '電磁波工学', instructor: '久保田' },
    { id: 'electrical-machinery-inoue', name: '電気機器工学', instructor: '井上' },
  ];

  const handleCourseClick = (courseId: string) => {
    if (onCourseClick) {
      onCourseClick(courseId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '工学部科目一覧' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">工学部科目一覧</h1>
          <p className="text-sm md:text-base text-gray-600">専門科目のレビューを見ることができます</p>
        </div>

        {/* 検索フォーム */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="科目名や担当者名で検索"
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2B4DCA] focus:shadow-md"
            />
            <Search className="absolute top-1/2 right-3 md:right-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* 科目一覧カード（PC3列・スマホ2列レイアウト） */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {courses
            .filter((course) =>
              course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white border border-gray-200 rounded-2xl p-3 md:p-4 hover:border-[#2B4DCA] hover:shadow-md transition-all text-left"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm md:text-base text-[#2B4DCA] hover:underline line-clamp-2">
                    {course.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">担当：{course.instructor}</p>
                </div>
              </button>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}