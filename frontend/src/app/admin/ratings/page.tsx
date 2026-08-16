'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import {
  createAdminRatingImport,
  deleteAdminRatingImport,
  getApiErrorMessage,
  listAdminRatingImports,
  type RatingImportBatch,
} from '@/lib/api';

function statusLabel(batch: RatingImportBatch) {
  return batch.status === 'published' ? '公開済み' : '下書き（未公開）';
}

function formatDateTime(value: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('ja-JP', { hour12: false });
}

function isCsvFile(file: File) {
  return (
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.toLowerCase().endsWith('.csv')
  );
}

export default function RatingsPage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [batches, setBatches] = useState<RatingImportBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'history') {
      setIsHistoryView(true);
    }
  }, []);

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const idToken = await getIdToken();
      const res = await listAdminRatingImports(idToken);
      setBatches(res.items);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'アップロード履歴の取得に失敗しました。'));
    } finally {
      setLoadingBatches(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleDeleteBatch = async (batch: RatingImportBatch) => {
    const confirmed = window.confirm(
      `${batch.source_filename || '元ファイル不明'} を削除します。よろしいですか？${
        batch.status === 'published' ? '\n※公開済みですが、ユーザー画面に反映済みの評価データは削除されません。' : ''
      }`
    );
    if (!confirmed) return;

    setDeletingId(batch.import_batch_id);
    setErrorMessage(null);
    try {
      const idToken = await getIdToken();
      await deleteAdminRatingImport(idToken, batch.import_batch_id);
      setBatches((prev) => prev.filter((b) => b.import_batch_id !== batch.import_batch_id));
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'インポート履歴の削除に失敗しました。'));
    } finally {
      setDeletingId(null);
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isCsvFile(file)) {
      setErrorMessage('CSVファイルを選択してください。');
      return;
    }
    setCsvFile(file);
    setErrorMessage(null);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setErrorMessage('CSVを選択してください。');
      return;
    }
    setErrorMessage(null);
    setUploading(true);
    try {
      const idToken = await getIdToken();
      const batch = await createAdminRatingImport(idToken, csvFile);
      router.push(`/admin/ratings/imports/${batch.import_batch_id}`);
    } catch (err) {
      console.error('Failed to import rating CSV:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          'CSVの解析に失敗しました。総合教養科目のおすすめ度CSVであることを確認するか、しばらくしてから再度お試しください。'
        )
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/ratings"
      title="評価"
      subtitle="総合教養科目のおすすめ度CSVをアップロードすると、授業ごとの平均値からAA〜Cのランクを自動算出します。"
    >
      <div className="space-y-6">
        {!isHistoryView ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">総合教養科目 おすすめ度CSV</p>
              <p className="mt-1 text-sm text-slate-500">
                対応範囲：総合教養科目のおすすめ度CSV（科目名, おすすめ度の列を想定。1行=1件の回答。UTF-8/Shift-JIS両対応）
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="text/csv,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ファイルを選択
                </button>
                {csvFile ? (
                  <span className="text-sm text-slate-600">
                    {csvFile.name}（{(csvFile.size / 1024).toFixed(1)} KB）
                    <button
                      type="button"
                      onClick={() => setCsvFile(null)}
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
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!csvFile || uploading}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {uploading ? '解析中...' : 'アップロードして解析'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryView(true)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              過去のインポート
            </button>
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2b4dca]">過去のインポート</p>
                <p className="text-sm text-slate-600">評価CSVのアップロード履歴と公開状況をまとめて確認できます。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryView(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
              >
                アップロード画面へ戻る
              </button>
            </div>

            {errorMessage ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {loadingBatches ? (
              <AdminLoadingBlock rows={3} />
            ) : batches.length === 0 ? (
              <p className="text-sm text-slate-500">まだインポート履歴がありません。</p>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div
                    key={batch.import_batch_id}
                    className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-slate-900">
                        {batch.source_filename || '元ファイル不明'}
                        <span
                          className={`ml-3 rounded-full px-3 py-1 text-xs font-semibold ${
                            batch.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {statusLabel(batch)}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">行数: {batch.row_count}</p>
                      <p className="text-sm text-slate-600">
                        アップロード: {formatDateTime(batch.created_at)}
                        {batch.published_at ? ` ／ 公開: ${formatDateTime(batch.published_at)}` : ''}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/ratings/imports/${batch.import_batch_id}`)}
                        className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
                      >
                        開く
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBatch(batch)}
                        disabled={deletingId === batch.import_batch_id}
                        className="inline-flex items-center justify-center rounded-full border border-red-300 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === batch.import_batch_id ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
