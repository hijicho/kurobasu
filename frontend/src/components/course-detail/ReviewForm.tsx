import { useState } from 'react';
import { Send } from 'lucide-react';

export type ReviewCategory = 'pros' | 'cons' | 'others';

interface ReviewFormProps {
  onSubmit: (review: { type: ReviewCategory; comment: string }) => Promise<void> | void;
  disabled?: boolean;
  disabledMessage?: string;
}

const categoryOptions: { value: ReviewCategory; label: string }[] = [
  { value: 'pros', label: '良かったところ' },
  { value: 'cons', label: '悪かったところ' },
  { value: 'others', label: 'その他の情報' },
];

export function ReviewForm({ onSubmit, disabled = false, disabledMessage }: ReviewFormProps) {
  const [type, setType] = useState<ReviewCategory>('pros');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !comment.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ type, comment: comment.trim() });
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError('投稿に失敗しました。入力内容と通信状況を確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
      <h3 className="text-base md:text-lg mb-4">口コミを投稿する</h3>

      {submitted && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          投稿しました。管理者の承認後に掲載されます。
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {disabled && disabledMessage && (
        <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm">
          {disabledMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              disabled={disabled || submitting}
              className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                type === option.value
                  ? 'border-[#2B4DCA] bg-blue-50 text-[#2B4DCA]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`${categoryOptions.find((option) => option.value === type)?.label}を入力`}
          rows={4}
          disabled={disabled || submitting}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || submitting || !comment.trim()}
            className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-[#2B4DCA] text-white rounded-xl text-sm md:text-base hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {submitting ? '投稿中' : '投稿する'}
          </button>
        </div>
      </form>
    </div>
  );
}
