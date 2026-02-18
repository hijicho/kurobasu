import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';
import { GlossaryModal } from '../components/GlossaryModal';

interface TimetableExamplesPageProps {
  onNavigateBack?: () => void;
}

export function TimetableExamplesPage({ onNavigateBack }: TimetableExamplesPageProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  
  const faculties = [
    { id: 'all', name: 'すべて' },
    { id: 'modern-system', name: '現代システム科学域' },
    { id: 'science', name: '理学部' },
    { id: 'engineering', name: '工学部' },
    { id: 'agriculture', name: '農学部' },
    { id: 'veterinary', name: '獣医学部' },
    { id: 'medicine', name: '医学部' },
    { id: 'nursing', name: '看護学部' },
    { id: 'human-life', name: '生活科学部' },
    { id: 'literature', name: '文学部' },
    { id: 'law', name: '法学部' },
    { id: 'economics', name: '経済学部' },
    { id: 'commerce', name: '商学部' },
  ];

  const examples = [
    {
      id: '1',
      title: '理学部 1年生の時間割例',
      description: '基礎教育科目を中心に組まれた時間割',
      imagePlaceholder: true,
      faculty: 'science',
    },
    {
      id: '2',
      title: '文学部 2年生の時間割例',
      description: '専門科目と般教のバランスの良い組み合わせ',
      imagePlaceholder: true,
      faculty: 'literature',
    },
    {
      id: '3',
      title: '医学部 3年生の時間割例',
      description: '専門科目が中心の密な時間割',
      imagePlaceholder: true,
      faculty: 'medicine',
    },
    {
      id: '4',
      title: '現代システム科学域 1年生の時間割例',
      description: '幅広い分野の科目を履修',
      imagePlaceholder: true,
      faculty: 'modern-system',
    },
    {
      id: '5',
      title: '工学部 2年生の時間割例',
      description: '専門基礎科目を中心に実験も履修',
      imagePlaceholder: true,
      faculty: 'engineering',
    },
    {
      id: '6',
      title: '経済学部 3年生の時間割例',
      description: 'ゼミナールと専門科目',
      imagePlaceholder: true,
      faculty: 'economics',
    },
  ];

  const filteredExamples = selectedFaculty === 'all' 
    ? examples 
    : examples.filter(ex => ex.faculty === selectedFaculty);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onGlossaryOpen={() => setGlossaryOpen(true)} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: 'みんなの時間割' },
        ]} />

        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={onNavigateBack}
            className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="mb-2">みんなの時間割</h1>
            <p className="text-gray-600 text-sm">先輩たちの履修パターンを参考にしましょう</p>
          </div>
        </div>

        {/* 学部フィルター */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm mb-3">学部で絞り込む</h3>
          <div className="flex flex-wrap gap-2">
            {faculties.map((faculty) => (
              <button
                key={faculty.id}
                onClick={() => setSelectedFaculty(faculty.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedFaculty === faculty.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {faculty.name}
              </button>
            ))}
          </div>
        </div>

        {/* 時間割例 */}
        <div className="space-y-8">
          {filteredExamples.length > 0 ? (
            filteredExamples.map((example) => (
              <div key={example.id} className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="mb-3">{example.title}</h2>
                <p className="text-gray-600 mb-6">{example.description}</p>
                
                {/* 画像プレースホルダー */}
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">画像プレースホルダー</p>
                    <p className="text-xs mt-1">後から時間割の画像を挿入できます</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-600">選択した学部の時間割例はまだ登録されていません</p>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="mb-3">注意事項</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>これらは参考例です。自分の興味や将来の進路に合わせて履修を組みましょう。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>CAP制（履修単位上限）に注意してください。</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>必修科目を優先して履修計画を立てましょう。</span>
            </li>
          </ul>
        </div>
      </main>

      <GlossaryModal isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <Footer />
    </div>
  );
}
