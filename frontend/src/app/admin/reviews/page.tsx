'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import { deleteAdminReview, getApiErrorMessage, listAdminReviews, updateReviewStatus, type AdminReview } from '@/lib/api';

const statusLabels: Record<AdminReview['status'], string> = {
  pending: '未確認',
  approved: '承認済み',
};

const typeLabels: Record<AdminReview['type'], string> = {
  pros: '良かったところ',
  cons: '悪かったところ',
  others: 'その他',
};

const termLabels: Record<string, string> = {
  spring: '前期',
  fall: '後期',
  intensive: '集中',
  year: '通年',
};

type ReviewFilter = 'pending' | 'approved' | 'all';

export default function ReviewsPage() {
  const { getIdToken } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingReviewId, setUpdatingReviewId] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const status = filter === 'all' ? undefined : filter;
      const res = await listAdminReviews(idToken, status);
      setReviews(res.items);
    } catch (err) {
      setError(getApiErrorMessage(err, '口コミ一覧の取得に失敗しました。'));
    } finally {
      setLoading(false);
    }
  }, [filter, getIdToken]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const counts = useMemo(() => {
    return reviews.reduce(
      (acc, review) => {
        acc[review.status] += 1;
        return acc;
      },
      { pending: 0, approved: 0 } satisfies Record<AdminReview['status'], number>
    );
  }, [reviews]);

  const handleStatusChange = async (reviewId: number, status: AdminReview['status']) => {
    setUpdatingReviewId(reviewId);
    setError(null);
    try {
      const idToken = await getIdToken();
      await updateReviewStatus(idToken, reviewId, status);
      await loadReviews();
    } catch (err) {
      setError(getApiErrorMessage(err, '口コミステータスの更新に失敗しました。'));
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleDelete = async (reviewId: number) => {
    setUpdatingReviewId(reviewId);
    setError(null);
    try {
      const idToken = await getIdToken();
      await deleteAdminReview(idToken, reviewId);
      await loadReviews();
    } catch (err) {
      setError(getApiErrorMessage(err, '口コミの削除に失敗しました。'));
    } finally {
      setUpdatingReviewId(null);
    }
  };

  return (
    <AdminLayout currentPath="/admin/reviews" title="口コミ" subtitle="投稿された口コミを確認して承認・削除できます。">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">口コミ一覧</p>
            <p className="text-sm text-slate-600">承認済みだけがユーザー画面に表示されます。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['pending', `未確認 ${filter === 'all' ? counts.pending : ''}`],
              ['approved', `承認済み ${filter === 'all' ? counts.approved : ''}`],
              ['all', 'すべて'],
            ] as [ReviewFilter, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === value ? 'bg-[#2b4dca] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label.trim()}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <AdminLoadingBlock rows={3} />
        ) : reviews.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 text-sm text-slate-600 shadow-sm">
            表示できる口コミはありません。
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((item) => (
              <div key={item.review_id} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#2b4dca]">
                        {item.academic_year || '年度未設定'}年度 {termLabels[item.term] ?? item.term}
                      </p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {typeLabels[item.type] ?? item.type}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </div>

                    <p className="mt-3 text-base font-semibold text-slate-900">
                      {item.subject_title || `開講ID: ${item.offering_id}`}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      担当: {item.instructor_names?.length ? item.instructor_names.join('、') : '未設定'} / 投稿者: {item.user_display_name || (item.user_id ? `User ${item.user_id}` : '匿名')}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.comment}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      投稿日: {new Date(item.created_at).toLocaleString('ja-JP', { hour12: false })}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={updatingReviewId === item.review_id}
                      onClick={() => handleStatusChange(item.review_id, 'approved')}
                      className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      承認
                    </button>
                    <button
                      type="button"
                      disabled={updatingReviewId === item.review_id}
                      onClick={() => handleDelete(item.review_id)}
                      className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
