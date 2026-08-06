import { useState, useEffect } from 'react';
import { BookOpen, BookMarked, Globe, Calendar, GraduationCap, Languages, ChevronDown, ChevronUp, Activity, Search } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { ExternalLinkButton } from '../components/ExternalLinkButton';
import { Header } from '../components/Header';
import { GlossaryModal } from '../components/GlossaryModal';
import { getCategories, Category, USE_MOCK_DATA } from '../lib/api';
import hamubasuLogo from '../assets/59962a0286c10949e8d3fa57e1256b8b69b96d84.png';
import bgPattern from '../assets/c00c039666ebe180d57a090c8744e0552d438ca4.png';
import titleImage from '../assets/573ad896cd92b11ef07ccb64a98726dc7a7aab11.png';

interface TopPageProps {
  isAuthenticated?: boolean;
}

export function TopPage({ isAuthenticated = false }: TopPageProps) {
  const [specializedOpen, setSpecializedOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モックカテゴリデータ
  const mockCategories: Category[] = [
    { category_id: 1, slug: 'general', name: '般教' },
    { category_id: 2, slug: 'second-language', name: '第二外国語' },
    { category_id: 3, slug: 'foundation', name: '基礎教育科目' },
    { category_id: 4, slug: 'first-year-seminar', name: '初年次教育科目（初ゼミ）' },
    { category_id: 5, slug: 'health-sports', name: '健康・スポーツ科学' },
    { category_id: 6, slug: 'english', name: '英語' },
    { category_id: 7, slug: 'specialized', name: '専門科目' },
  ];

  // カテゴリデータをAPIから取得
  useEffect(() => {
    const fetchCategories = async () => {
      // モックデータモードの場合はAPI呼び出しをスキップ
      if (USE_MOCK_DATA) {
        setCategories(mockCategories);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCategories();
        setCategories(response.items);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        console.warn('バックエンドAPIに接続できません。モックデータを使用します。');
        
        // モックデータを使用（API接続失敗時のフォールバック）
        setCategories(mockCategories);
        setError(null); // エラーは非表示にする（モックデータで動作）
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const quickLinks = [
    {
      title: '総合教養科目（般教）',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/courses/general-education',
    },
    {
      title: '初年次教育科目（初ゼミ）',
      icon: <GraduationCap className="w-5 h-5" />,
      href: '/courses/first-year-education',
    },
    {
      title: '基礎教育科目',
      icon: <BookMarked className="w-5 h-5" />,
      href: '/courses/foundation-list',
    },
    {
      title: '情報リテラシー科目',
      icon: <Globe className="w-5 h-5" />,
      href: '/instructors/information-literacy',
    },
    {
      title: '外国語科目(英語必修)-日本語教師',
      icon: <Languages className="w-5 h-5" />,
      href: '/instructors/english-japanese',
    },
    {
      title: '外国語科目(英語必修)-英語教師',
      icon: <Languages className="w-5 h-5" />,
      href: '/instructors/english-native',
    },
  ];

  const specializedCourses = [
    { name: '現代システム科学域', href: '/courses/specialized/modern-system' },
    { name: '理学部', href: '/courses/specialized/science' },
    { name: '工学部', href: '/courses/specialized/engineering' },
    { name: '農学部', href: '/courses/specialized/agriculture' },
    { name: '獣医学部', href: '/courses/specialized/veterinary' },
    { name: '医学部医学科', href: '/courses/specialized/medicine' },
    { name: '医学部リハビリテーション学科', href: '/courses/specialized/medical-rehab' },
    { name: '看護学部', href: '/courses/specialized/nursing' },
    { name: '生活科学部', href: '/courses/specialized/human-life' },
    { name: '文学部', href: '/courses/specialized/literature' },
    { name: '法学部', href: '/courses/specialized/law' },
  { name: '経済学部', href: '/courses/specialized/economics' },
    { name: '商学部', href: '/courses/specialized/commerce' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <Header
        isAuthenticated={isAuthenticated}
      />
      
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* 年度表示 */}
          <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
              <img src={titleImage.src ?? titleImage} alt="2026年度 前期" className="h-12 md:h-16 w-auto" />
            </div>
            <p className="text-xs text-gray-500 mt-3">何かあれば @kurobasu_ocu まで連絡を。<br />落単・情報の誤りには一切責任を負いません。</p>
          </div>

          {/* 大学用語リンク */}
          <div className="text-center mb-8">
            <button
              onClick={() => setGlossaryOpen(true)}
              className="text-theme-primary hover:underline inline-flex items-center gap-1 font-bold"
            >
              大学用語はこちら
            </button>
          </div>

          {/* カテゴリボタン＆専門科目セクション - 統一背景 */}
          <div 
            className="relative rounded-2xl overflow-hidden mb-6 p-6"
            style={{
              backgroundImage: `url(${bgPattern.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* カテゴリボタン */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 bg-theme-primary-light rounded-lg flex items-center justify-center shrink-0">
                    {link.icon}
                  </div>
                  <h3 className="font-bold leading-tight text-[14px]">{link.title}</h3>
                </a>
              ))}
            </div>

            {/* 専門科目（アコーディオン） */}
            <div className="rounded-xl overflow-hidden">
              <button
                onClick={() => setSpecializedOpen(!specializedOpen)}
                className="w-full p-3 flex items-center justify-between hover:shadow-lg transition-all bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-theme-primary-light rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" style={{ color: '#000000' }} />
                  </div>
                  <h3 className="font-bold text-[14px]">専門科目</h3>
                </div>
                {specializedOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {specializedOpen && (
                <div className="px-3 pb-3 bg-white">
                  <div className="pt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specializedCourses.map((course, index) => (
                      (course as any).disabled ? (
                        <div
                          key={index}
                          className="px-3 py-2 bg-gray-200 rounded-lg text-center text-xs md:text-sm text-gray-500 cursor-not-allowed"
                        >
                          <div>{course.name}</div>
                          <div className="text-xs text-red-600 mt-1">※修正中です</div>
                        </div>
                      ) : (
                        <a
                          key={index}
                          href={course.href}
                          className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-theme-primary-light transition-colors text-center text-xs md:text-sm"
                        >
                          {course.name}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 外部リンク */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ExternalLinkButton
              href="https://hamubasu.com"
              logo={<img src={hamubasuLogo.src ?? hamubasuLogo} alt="ハムバス" className="h-full w-auto object-contain" />}
              label="ハムバス"
            />
            <ExternalLinkButton
              href="https://catalog.sp.omu.ac.jp/ja"
              logo={
                <div className="w-8 h-8 bg-theme-primary-light rounded-lg flex items-center justify-center">
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-theme-primary" />
                    <Search className="w-2.5 h-2.5 text-theme-primary absolute -bottom-0.5 -right-0.5" strokeWidth={2.5} />
                  </div>
                </div>
              }
              label="授業カタログ"
            />
          </div>
        </div>
      </main>

      {/* 大学用語モーダル */}
      <GlossaryModal isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      <Footer />
    </div>
  );
}