import { useState } from 'react';
import { Heart, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface CourseDetailPageProps {
  courseId?: string;
  categoryName?: string;
  isAuthenticated?: boolean;
}

export function CourseDetailPage({ courseId = '1', categoryName = '般教', isAuthenticated = false }: CourseDetailPageProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2025');

  // ダミーのお気に入り数
  const favoriteCount = 128;
  
  const years = ['2025', '2024', '2023'];
  
  const course = {
    name: '子どもの生活と健康教育',
    instructor: '三宅孝昭',
    rating: 'A' as const,
    evaluationCriteria: '期末テスト、期末レポート、毎回の課題',
    examPolicy: '教科書',
    format: 'PDF資料配布、動画配信などのオンデマンド授業・実習、対面授業・実習',
    pros: [
      '遠隔動画を見なくてもテストは余裕だった',
      '全てオンデマンド形式',
      '成績評価がテスト100％',
      '勉強しなくても教科書があれば単位が取れる',
      '教科書代3500円で単位を買ったような感覚',
    ],
    cons: [
      '教科書が高い',
      '教科書の書き抜き問題なのに成績評価が悪く、なぜB評価なのか分からなかった',
    ],
  };

  // 評価バッジのスタイル
  const getRatingStyle = (rating: string) => {
    const styles = {
      AA: { backgroundColor: 'rgba(252, 156, 90, 0.1)', borderColor: '#fc9c5a', color: '#fc9c5a' },
      A: { backgroundColor: 'rgba(248, 37, 1, 0.1)', borderColor: '#f82501', color: '#f82501' },
      B: { backgroundColor: 'rgba(39, 172, 73, 0.1)', borderColor: '#27ac49', color: '#27ac49' },
      C: { backgroundColor: 'rgba(34, 176, 236, 0.1)', borderColor: '#22b0ec', color: '#22b0ec' },
    };
    return styles[rating as keyof typeof styles] || styles.A;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '科目一覧', href: '/courses' },
          { label: course.name },
        ]} />

        <div className="space-y-6">
          {/* 授業名・教員名・評価 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="flex-1">{course.name}</h1>
              {/* 総合評価バッジ */}
              <span
                className="px-4 py-2 rounded-xl shrink-0 border-2"
                style={getRatingStyle(course.rating)}
              >
                {course.rating}
              </span>
            </div>
            <p className="text-gray-600 mb-4">担当教員：{course.instructor}</p>
            
            {/* 年度選択 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {year}年度
                </button>
              ))}
            </div>
            
            {/* お気に入りボタン */}
            {isAuthenticated ? (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                    isFavorited
                      ? 'bg-pink-100 border border-pink-300 text-pink-700 hover:bg-pink-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-pink-600' : ''}`} />
                  {isFavorited ? 'お気に入り済み' : 'お気に入りに追加'}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
                  <span>お気に入り {favoriteCount}人</span>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  disabled
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2 border border-gray-200"
                >
                  <Heart className="w-5 h-5" />
                  お気に入りに追加
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  ログインすると使えます
                </p>
              </div>
            )}
          </div>

          {/* 横並び3カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 評価基準 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-600 text-sm mb-3">評価基準</h3>
              <p className="text-gray-900">{course.evaluationCriteria}</p>
            </div>

            {/* 前年度授業形態 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-600 text-sm mb-3">前年度授業形態</h3>
              <p className="text-gray-900">{course.format}</p>
            </div>

            {/* テスト持ち込み */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-gray-600 text-sm mb-3">テスト持ち込み</h3>
              <p className="text-gray-900">{course.examPolicy}</p>
            </div>
          </div>

          {/* 良かったところ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2>良かったところ</h2>
            </div>
            <ul className="space-y-3">
              {course.pros.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 悪かったところ */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2>悪かったところ</h2>
            </div>
            <ul className="space-y-3">
              {course.cons.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}