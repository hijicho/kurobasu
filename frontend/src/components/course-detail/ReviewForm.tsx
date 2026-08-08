import { useState } from 'react';
import { Send } from 'lucide-react';

export type ReviewCategory = 'pros' | 'cons' | 'others';

interface ReviewFormProps {
  onSubmit: (text: string, category: ReviewCategory) => void;
}

const CATEGORIES: { value: ReviewCategory; label: string }[] = [
  { value: 'pros', label: '良かったところ' },
  { value: 'cons', label: '悪かったところ' },
  { value: 'others', label: 'その他の情報' },
];

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ReviewCategory>('pros');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim(), category);
    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
      <h3 className="text-base md:text-lg mb-4">口コミを投稿する</h3>

      {submitted && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          投稿しました。管理者の承認後に掲載されます。
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                category === cat.value
                  ? 'bg-[#2B4DCA] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="口コミを書いてください"
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#2B4DCA] text-white rounded-xl text-sm md:text-base hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            投稿する
          </button>
        </div>
      </form>
    </div>
  );
}
