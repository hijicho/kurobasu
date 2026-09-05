'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import {
  approveAllReviews,
  deleteAdminReview,
  getApiErrorMessage,
  getSiteSettings,
  importAdminReviewsCSV,
  listAdminReviews,
  updateReviewStatus,
  type AdminReview,
  type ImportAdminReviewsResponse,
} from '@/lib/api';
import {
  directCategories,
  secondLanguageCategories,
  specializedCategories,
  categoryButtonClass,
} from '@/lib/admin-categories';

const statusLabels: Record<AdminReview['status'], string> = {
  pending: '未確認',
  approved: '承認済み',
};

const typeLabels: Record<AdminReview['type'], string> = {
  pros: '良かったところ',
  cons: '悪かったところ',
  others: 'その他',
  criteria: '評価基準',
  test_bring_in: 'テスト持ち込み',
};

const termLabels: Record<string, string> = {
  spring: '前期',
  fall: '後期',
};

type ReviewFilter = 'pending' | 'approved' | 'all';

const termOptions = [
  { key: 'spring', label: '前期' },
  { key: 'fall', label: '後期' },
];

function isCsvFile(file: File) {
  return (
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.toLowerCase().endsWith('.csv')
  );
}

export default function ReviewsPage() {
  const { getIdToken } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingReviewId, setUpdatingReviewId] = useState<number | null>(null);
  const [approvingAll, setApprovingAll] = useState(false);

  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkYear, setBulkYear] = useState<number>(new Date().getFullYear());
  const [bulkTerm, setBulkTerm] = useState(termOptions[0].key);
  const [bulkCategorySlug, setBulkCategorySlug] = useState(directCategories[0].slug);
  const [bulkSpecializedOpen, setBulkSpecializedOpen] = useState(false);
  const [bulkSecondLanguageOpen, setBulkSecondLanguageOpen] = useState(false);
  const [bulkCsvFile, setBulkCsvFile] = useState<File | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<ImportAdminReviewsResponse | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const bulkSelectedCategoryLabel =
    [...directCategories, ...specializedCategories, ...secondLanguageCategories].find(
      (category) => category.slug === bulkCategorySlug
    )?.label ?? bulkCategorySlug;

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        setBulkYear(res.default_academic_year);
        if (termOptions.some((item) => item.key === res.default_term)) {
          setBulkTerm(res.default_term);
        }
      })
      .catch(() => undefined);
  }, []);

  const handleBulkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isCsvFile(file)) {
      setBulkError('CSVファイルを選択してください。');
      return;
    }
    setBulkCsvFile(file);
    setBulkError(null);
    setBulkResult(null);
  };

  const handleBulkImport = async () => {
    if (!bulkCsvFile) {
      setBulkError('CSVを選択してください。');
      return;
    }
    setBulkImporting(true);
    setBulkError(null);
    setBulkResult(null);
    try {
      const idToken = await getIdToken();
      const res = await importAdminReviewsCSV(idToken, bulkCategorySlug, bulkYear, bulkTerm, bulkCsvFile);
      setBulkResult(res);
      setBulkCsvFile(null);
      await loadReviews();
    } catch (err) {
      setBulkError(getApiErrorMessage(err, '口コミの一括追加に失敗しました。'));
    } finally {
      setBulkImporting(false);
    }
  };

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

  const handleApproveAll = async () => {
    if (!window.confirm('未確認の口コミをすべて承認します。よろしいですか？')) {
      return;
    }
    setApprovingAll(true);
    setError(null);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      const res = await approveAllReviews(idToken);
      setMessage(`${res.approved_count}件の口コミを承認しました。`);
      await loadReviews();
    } catch (err) {
      setError(getApiErrorMessage(err, '一括承認に失敗しました。'));
    } finally {
      setApprovingAll(false);
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
          <div className="flex flex-wrap items-center gap-2">
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
            <button
              type="button"
              disabled={approvingAll}
              onClick={handleApproveAll}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approvingAll ? '承認中...' : 'すべて承認'}
            </button>
            <button
              type="button"
              onClick={() => setBulkAddOpen((v) => !v)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                bulkAddOpen
                  ? 'border-[#2b4dca] bg-[#2b4dca] text-white'
                  : 'border-[#2b4dca] bg-white text-[#2b4dca] hover:bg-[#eff3ff]'
              }`}
            >
              一括追加
            </button>
          </div>
        </div>

        {bulkAddOpen ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">口コミの一括追加（CSV）</p>
            <p className="mt-1 text-xs text-slate-500">
              対象のカテゴリ・年度・学期を選び、その時間割に既に登録済みの授業と講義名・担当教員名などで一致させてCSVの口コミを取り込みます。取り込んだ口コミは未確認として登録されます。
            </p>

            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-900">対象のカテゴリ</p>
              <p className="mt-1 text-xs text-slate-500">選択中: {bulkSelectedCategoryLabel}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {directCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setBulkCategorySlug(category.slug)}
                    className={categoryButtonClass(bulkCategorySlug === category.slug)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setBulkSpecializedOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800"
                >
                  専門科目
                  {bulkSpecializedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {bulkSpecializedOpen ? (
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {specializedCategories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setBulkCategorySlug(category.slug)}
                        className={categoryButtonClass(bulkCategorySlug === category.slug)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setBulkSecondLanguageOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800"
                >
                  第二外国語
                  {bulkSecondLanguageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {bulkSecondLanguageOpen ? (
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {secondLanguageCategories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => setBulkCategorySlug(category.slug)}
                        className={categoryButtonClass(bulkCategorySlug === category.slug)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">年度</span>
                <input
                  type="number"
                  value={bulkYear}
                  onChange={(event) => setBulkYear(Number(event.target.value))}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#2b4dca] focus:ring-2 focus:ring-[#2b4dca]/20"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">学期</span>
                <select
                  value={bulkTerm}
                  onChange={(event) => setBulkTerm(event.target.value)}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#2b4dca] focus:ring-2 focus:ring-[#2b4dca]/20"
                >
                  {termOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">口コミCSV</p>
              <p className="mt-1 text-sm text-slate-500">
                列：曜日/時限/講義・実習等の実施形態/講義名/担当教員名（フルネーム・姓名間空白なし）/評価基準/テスト持ち込み/授業の良かったところは？/授業の悪かったところは？/試験やレポート、発表に関して、後輩に伝えたいことはありますか？/授業のおすすめ度を教えてください/その他情報があれば教えてください（UTF-8/Shift-JIS両対応）
              </p>
              <input
                ref={bulkFileInputRef}
                type="file"
                accept="text/csv,.csv"
                className="hidden"
                onChange={handleBulkFileChange}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => bulkFileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ファイルを選択
                </button>
                {bulkCsvFile ? (
                  <span className="text-sm text-slate-600">
                    {bulkCsvFile.name}（{(bulkCsvFile.size / 1024).toFixed(1)} KB）
                    <button
                      type="button"
                      onClick={() => setBulkCsvFile(null)}
                      className="ml-2 text-slate-400 hover:text-red-600"
                      aria-label="CSVの選択を解除"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">未選択</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleBulkImport}
                disabled={!bulkCsvFile || bulkImporting}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {bulkImporting ? '取り込み中...' : 'CSVを取り込んで一括追加'}
              </button>

              {bulkError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{bulkError}</div>
              ) : null}

              {bulkResult ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  <p>
                    {bulkResult.total_rows}件中{bulkResult.matched_rows}件の授業を一致させ、口コミ{bulkResult.review_rows_inserted}
                    件・おすすめ度{bulkResult.ratings_inserted}件を追加しました（未確認として登録されました）。
                  </p>
                  {bulkResult.unmatched.length > 0 ? (
                    <div className="mt-2 text-xs text-emerald-800">
                      <p className="font-semibold">一致しなかった講義名／担当教員（{bulkResult.unmatched.length}件）:</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5">
                        {bulkResult.unmatched.map((entry) => (
                          <li key={entry}>{entry}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>
        ) : null}

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
