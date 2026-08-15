'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import {
  createAdminTimetableImport,
  getApiErrorMessage,
  getSiteSettings,
  listAdminTimetableImports,
  type TimetableImportBatch,
} from '@/lib/api';

const termOptions = [
  { key: 'spring', label: '前期' },
  { key: 'fall', label: '後期' },
];

function statusLabel(batch: TimetableImportBatch) {
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

export default function TimetablePage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());
  const [term, setTerm] = useState(termOptions[0].key);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [intensiveCsvFile, setIntensiveCsvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const intensiveFileInputRef = useRef<HTMLInputElement | null>(null);

  const [batches, setBatches] = useState<TimetableImportBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isHistoryView, setIsHistoryView] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        setAcademicYear(res.default_academic_year);
        if (termOptions.some((item) => item.key === res.default_term)) {
          setTerm(res.default_term);
        }
      })
      .catch(() => undefined);
  }, []);

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const idToken = await getIdToken();
      const res = await listAdminTimetableImports(idToken, 'general-education');
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

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFile = (file: File) => {
    if (!isCsvFile(file)) {
      setErrorMessage('CSVファイルを選択してください。');
      return;
    }
    setCsvFile(file);
    setErrorMessage(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFile(file);
    event.target.value = '';
  };

  const handleIntensiveFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!isCsvFile(file)) {
      setErrorMessage('CSVファイルを選択してください。');
      return;
    }
    setIntensiveCsvFile(file);
    setErrorMessage(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
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
      const batch = await createAdminTimetableImport(
        idToken,
        academicYear,
        term,
        csvFile,
        'general-education',
        intensiveCsvFile
      );
      router.push(`/admin/timetable/imports/${batch.import_batch_id}`);
    } catch (err) {
      console.error('Failed to import timetable CSV:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          'CSVの解析に失敗しました。総合教養科目の時間割CSVであることを確認するか、しばらくしてから再度お試しください。'
        )
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/timetable"
      title="時間割"
      subtitle="総合教養科目の時間割CSVをアップロードすると自動で読み取り、スプレッドシート感覚で確認・修正してから公開できます。"
    >
      <div className="space-y-6">
        {!isHistoryView ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div
              role="button"
              tabIndex={0}
              onClick={openFileDialog}
              onKeyDown={handleKeyDown}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[24px] border border-dashed px-8 py-16 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b4dca] ${
                dragActive ? 'border-[#2b4dca] bg-[#eff3ff]' : 'border-slate-300 bg-white'
              }`}
            >
              <p className="text-lg font-semibold text-slate-800">ここにCSVをドラッグ</p>
              <p className="mt-2 text-sm text-slate-500">クリックまたはドラッグで CSV を選択できます。</p>
              <p className="mt-3 text-sm text-slate-400">
                対応範囲：総合教養科目の時間割CSV（年度,学期,曜日,時限,科目名,担当教員,授業コード,講義室の列を想定。UTF-8/Shift-JIS両対応）
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="text/csv,.csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {csvFile ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">選択済みのCSV</p>
                <p className="mt-2">{csvFile.name}</p>
                <p className="mt-1 text-slate-500">サイズ: {(csvFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">集中講義のCSV（任意）</p>
              <p className="mt-1 text-sm text-slate-500">
                日付指定で開講される集中講義がある場合は、集中講義のCSVも合わせて選択してください。タイムテーブル下の一覧に反映されます。
              </p>
              <input
                ref={intensiveFileInputRef}
                type="file"
                accept="text/csv,.csv"
                className="hidden"
                onChange={handleIntensiveFileChange}
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => intensiveFileInputRef.current?.click()}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  ファイルを選択
                </button>
                {intensiveCsvFile ? (
                  <span className="text-sm text-slate-600">
                    {intensiveCsvFile.name}（{(intensiveCsvFile.size / 1024).toFixed(1)} KB）
                    <button
                      type="button"
                      onClick={() => setIntensiveCsvFile(null)}
                      className="ml-2 text-slate-400 hover:text-red-600"
                      aria-label="集中講義のCSVの選択を解除"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">未選択</span>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">年度</span>
                <input
                  type="number"
                  value={academicYear}
                  onChange={(event) => setAcademicYear(Number(event.target.value))}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#2b4dca] focus:ring-2 focus:ring-[#2b4dca]/20"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">学期</span>
                <select
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#2b4dca] focus:ring-2 focus:ring-[#2b4dca]/20"
                >
                  {termOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

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
                <p className="text-sm text-slate-600">アップロード履歴と公開状況を確認できます。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryView(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
              >
                アップロード画面へ戻る
              </button>
            </div>

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
                        {batch.academic_year}年度 {termOptions.find((t) => t.key === batch.term)?.label ?? batch.term}
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
                      <p className="text-sm text-slate-600">元ファイル: {batch.source_filename || '-'}</p>
                      <p className="text-sm text-slate-600">行数: {batch.row_count}</p>
                      <p className="text-sm text-slate-600">
                        アップロード: {formatDateTime(batch.created_at)}
                        {batch.published_at ? ` ／ 公開: ${formatDateTime(batch.published_at)}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/timetable/imports/${batch.import_batch_id}`)}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c] sm:mt-0"
                    >
                      開く
                    </button>
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
