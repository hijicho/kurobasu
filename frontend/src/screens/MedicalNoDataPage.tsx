import { AlertCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface MedicalNoDataPageProps {
  isAuthenticated?: boolean;
}

export function MedicalNoDataPage({ isAuthenticated = false }: MedicalNoDataPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '医学部医学科' },
        ]} />

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">医学部医学科</h1>
        </div>

        {/* 情報未掲載の案内 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-[#2B4DCA]" />
            </div>
          </div>
          
          <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-800">
            情報未掲載
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 mb-4">
            現在、この学部の授業レビュー情報は掲載されていません
          </p>
          
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm md:text-base text-[#2B4DCA] font-medium">
              授業情報・レビューを募集しています
            </p>
          </div>
          
          <p className="text-xs md:text-sm text-gray-500">
            情報が集まり次第、順次掲載してまいります
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
