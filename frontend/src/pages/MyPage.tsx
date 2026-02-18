import { useState } from 'react';
import { User, LogIn, Heart, Calendar, Share2, Check, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TimetableView } from '../components/TimetableView';

interface Course {
  id: string;
  name: string;
  instructor: string;
  format: string;
  level: 'AA' | 'A' | 'B' | 'C';
  rating: number;
  ratingCount: number;
  period: number;
  day: number;
  isConfirmed: boolean;
}

interface MyPageProps {
  onNavigateToLogin?: () => void;
  onNavigateToCourse?: (courseId: string) => void;
  isAuthenticated?: boolean;
}

export function MyPage({ onNavigateToLogin, onNavigateToCourse, isAuthenticated = false }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'mytimetable'>('favorites');

  // サンプル：お気に入り登録済みの授業データ
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([
    {
      id: '1',
      name: 'マクロ経済学入門',
      instructor: '山田太郎',
      format: '対面',
      level: 'AA' as const,
      rating: 4.5,
      ratingCount: 12,
      period: 1,
      day: 0, // 月曜
      isConfirmed: false,
    },
    {
      id: '3',
      name: '社会学入門',
      instructor: '鈴木次郎',
      format: '対面',
      level: 'B' as const,
      rating: 4.2,
      ratingCount: 8,
      period: 2,
      day: 2, // 水曜
      isConfirmed: false,
    },
    {
      id: '4',
      name: '哲学基礎',
      instructor: '田中三郎',
      format: '遠隔',
      level: 'A' as const,
      rating: 4.8,
      ratingCount: 15,
      period: 2,
      day: 1, // 火曜
      isConfirmed: false,
    },
    {
      id: '5',
      name: '文化人類学',
      instructor: '伊藤美咲',
      format: '対面',
      level: 'C' as const,
      rating: 3.5,
      ratingCount: 6,
      period: 3,
      day: 3, // 木曜
      isConfirmed: false,
    },
  ]);

  // 確定された授業の時間割を生成
  const confirmedTimetable = favoriteCourses
    .filter(course => course.isConfirmed)
    .map(course => ({
      period: course.period,
      day: course.day,
      courses: [{
        id: course.id,
        name: course.name,
        instructor: course.instructor,
        format: course.format,
        level: course.level,
        rating: course.rating,
        ratingCount: course.ratingCount,
      }]
    }));

  // お気に入り時間割（すべて表示）
  const favoriteSlots = favoriteCourses.map(course => ({
    period: course.period,
    day: course.day,
    courses: [{
      id: course.id,
      name: course.name,
      instructor: course.instructor,
      format: course.format,
      level: course.level,
      rating: course.rating,
      ratingCount: course.ratingCount,
    }]
  }));

  const hasFavorites = favoriteCourses.length > 0;
  const hasConfirmed = confirmedTimetable.length > 0;

  // 確定ボタンのハンドラー
  const handleToggleConfirm = (courseId: string) => {
    setFavoriteCourses(prev => prev.map(course => {
      if (course.id === courseId) {
        const willBeConfirmed = !course.isConfirmed;
        
        // 確定する場合、同じ時間帯に確定済みの授業があるかチェック
        if (willBeConfirmed) {
          const conflictExists = prev.some(
            c => c.id !== courseId && 
                 c.isConfirmed && 
                 c.period === course.period && 
                 c.day === course.day
          );
          
          if (conflictExists) {
            alert('この時間帯には既に確定済みの授業があります');
            return course;
          }
        }
        
        return { ...course, isConfirmed: willBeConfirmed };
      }
      return course;
    }));
  };

  // 投稿ボタンのハンドラー
  const handlePublish = () => {
    if (confirmedTimetable.length === 0) {
      alert('確定された授業がありません。まず授業を確定してください。');
      return;
    }
    alert('みんなの時間割に投稿しました！');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="mb-4">マイページ</h1>
            <p className="text-gray-600 mb-8">
              マイページを利用するにはログインが必要です
            </p>
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              ログイン
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 px-6 py-8">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="mb-8">マイページ</h1>
          
          {/* タブ */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
              <h2>お気に入りの授業</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'favorites' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                お気に入り
              </button>
              <button
                onClick={() => setActiveTab('mytimetable')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'mytimetable' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                マイ時間割（確定済み）
              </button>
            </div>
          </div>

          {/* お気に入り時間割（確定ボタン付き） */}
          {activeTab === 'favorites' && (
            <div className="mb-8">
              {hasFavorites ? (
                <>
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      各授業の「確定」ボタンを押すと、時間割に確定配置されます。確定された授業のみが「マイ時間割」に表示されます。
                    </p>
                  </div>
                  
                  {/* 授業カード一覧 */}
                  <div className="space-y-4 mb-6">
                    {favoriteCourses.map((course) => (
                      <div
                        key={course.id}
                        className={`bg-white border-2 rounded-xl p-4 transition-all ${
                          course.isConfirmed
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 cursor-pointer" onClick={() => onNavigateToCourse?.(course.id)}>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm">{course.name}</h3>
                              {course.isConfirmed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white rounded-full text-xs">
                                  <Check className="w-3 h-3" />
                                  確定済み
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{['月', '火', '水', '木', '金'][course.day]}曜{course.period}限</span>
                              <span>{course.format}</span>
                              <span className="font-semibold">評価: {course.level}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleToggleConfirm(course.id)}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                              course.isConfirmed
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {course.isConfirmed ? (
                              <>
                                <X className="w-4 h-4" />
                                <span>確定解除</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>確定</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 時間割プレビュー */}
                  <TimetableView 
                    slots={favoriteSlots}
                    onCourseClick={(courseId) => {
                      onNavigateToCourse?.(courseId);
                    }}
                  />
                </>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">お気に入りした授業がここに表示されます</p>
                  <a 
                    href="/"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    カテゴリから探す
                  </a>
                </div>
              )}
            </div>
          )}

          {/* マイ時間割（確定済みのみ） */}
          {activeTab === 'mytimetable' && (
            <div className="mb-8">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h2>マイ時間割</h2>
                </div>
              </div>
              
              {hasConfirmed ? (
                <>
                  <TimetableView 
                    slots={confirmedTimetable}
                    onCourseClick={(courseId) => {
                      onNavigateToCourse?.(courseId);
                    }}
                  />
                  
                  {/* 投稿ボタン */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handlePublish}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-base"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>みんなの時間割に投稿する</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>確定された授業のみが投稿対象です</p>
                  </div>
                </>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">確定された授業がありません</p>
                  <p className="text-sm text-gray-500 mb-6">「お気に入り」タブから授業を確定してください</p>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    お気に入りを見る
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* その他の情報 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="mb-4">プロフィール</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">学部・学科</span>
                  <p>現代システム科学域</p>
                </div>
                <div>
                  <span className="text-gray-600">学年</span>
                  <p>2年生</p>
                </div>
              </div>
            </div>
            
            {/* 履修統計 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="mb-4">履修統計</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">お気に入り登録数</span>
                  <span>{favoriteCourses.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">確定授業数</span>
                  <span>{favoriteCourses.filter(c => c.isConfirmed).length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">取得単位数</span>
                  <span>42単位</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
