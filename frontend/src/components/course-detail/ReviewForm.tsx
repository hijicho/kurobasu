import { useState } from 'react';
import { Send } from 'lucide-react';

export type ReviewCategory = 'pros' | 'cons' | 'others';

interface ReviewFormProps {
  onSubmit: (review: { pros: string; cons: string; others: string }) => Promise<void> | void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ReviewForm({ onSubmit, disabled = false, disabledMessage }: ReviewFormProps) {
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [others, setOthers] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !pros.trim() || !cons.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ pros: pros.trim(), cons: cons.trim(), others: others.trim() });
      setPros('');
      setCons('');
      setOthers('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError('投稿に失敗しました。ログイン状態と通信状況を確認してください。');
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
        <textarea
          value={pros}
          onChange={(e) => setPros(e.target.value)}
          placeholder="良かったところ（必須）"
          rows={3}
          disabled={disabled || submitting}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
        />

        <textarea
          value={cons}
          onChange={(e) => setCons(e.target.value)}
          placeholder="悪かったところ（必須）"
          rows={3}
          disabled={disabled || submitting}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
        />

        <textarea
          value={others}
          onChange={(e) => setOthers(e.target.value)}
          placeholder="その他の情報（任意）"
          rows={3}
          disabled={disabled || submitting}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || submitting || !pros.trim() || !cons.trim()}
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
