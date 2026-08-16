'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

interface CategoryOption {
  slug: string;
  label: string;
}

const directCategories: CategoryOption[] = [
  { slug: 'general-education', label: '総合教養科目' },
  { slug: 'first-year-education', label: '初年次教育科目' },
  { slug: 'foundation-list', label: '基礎教育科目' },
  { slug: 'information-literacy', label: '情報リテラシー科目' },
  { slug: 'english-japanese', label: '外国語科目（英語必修）ー日本語教師' },
  { slug: 'english-native', label: '外国語科目（英語必修）ー英語教師' },
];

const specializedCategories: CategoryOption[] = [
  { slug: 'modern-system', label: '現代システム科学域' },
  { slug: 'science', label: '理学部' },
  { slug: 'engineering', label: '工学部' },
  { slug: 'agriculture', label: '農学部' },
  { slug: 'veterinary', label: '獣医学部' },
  { slug: 'medicine', label: '医学部医学科' },
  { slug: 'medical-rehab', label: '医学部リハビリテーション学科' },
  { slug: 'nursing', label: '看護学部' },
  { slug: 'human-life', label: '生活科学部' },
  { slug: 'literature', label: '文学部' },
  { slug: 'law', label: '法学部' },
  { slug: 'economics', label: '経済学部' },
  { slug: 'commerce', label: '商学部' },
];

const secondLanguageCategories: CategoryOption[] = [
  { slug: 'chinese', label: '中国語' },
  { slug: 'korean', label: '朝鮮語' },
  { slug: 'russian', label: 'ロシア語' },
  { slug: 'german', label: 'ドイツ語' },
  { slug: 'french', label: 'フランス語' },
];

const allCategories: CategoryOption[] = [
  ...directCategories,
  ...specializedCategories,
  ...secondLanguageCategories,
];

function categoryButtonClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-bold transition ${
    active
      ? 'border-[#2b4dca] bg-[#2b4dca] text-white'
      : 'border-slate-300 bg-white text-slate-700 hover:border-[#2b4dca] hover:text-[#2b4dca]'
  }`;
}

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
  const [categorySlug, setCategorySlug] = useState(directCategories[0].slug);
  const [specializedOpen, setSpecializedOpen] = useState(false);
  const [secondLanguageOpen, setSecondLanguageOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [intensiveCsvFile, setIntensiveCsvFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const intensiveFileInputRef = useRef<HTMLInputElement | null>(null);

  const [batches, setBatches] = useState<TimetableImportBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [isHistoryView, setIsHistoryView] = useState(false);

  const selectedCategoryLabel =
    allCategories.find((category) => category.slug === categorySlug)?.label ?? categorySlug;

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
      const res = await listAdminTimetableImports(idToken, categorySlug);
      setBatches(res.items);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, 'アップロード履歴の取得に失敗しました。'));
    } finally {
      setLoadingBatches(false);
    }
  }, [getIdToken, categorySlug]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const openFileDialog = () => fileInputRef.current?.click();

  const selectCategory = (slug: string) => {
    setCategorySlug(slug);
    setCsvFile(null);
    setIntensiveCsvFile(null);
    setErrorMessage(null);
  };

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
        categorySlug,
        intensiveCsvFile
      );
      router.push(`/admin/timetable/imports/${batch.import_batch_id}`);
    } catch (err) {
      console.error('Failed to import timetable CSV:', err);
      setErrorMessage(
        getApiErrorMessage(
          err,
          `CSVの解析に失敗しました。${selectedCategoryLabel}の時間割CSVであることを確認するか、しばらくしてから再度お試しください。`
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
      subtitle="カテゴリを選んで時間割CSVをアップロードすると自動で読み取り、スプレッドシート感覚で確認・修正してから公開できます。"
    >
      <div className="space-y-6">
        {!isHistoryView ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-900">インポート対象のカテゴリ</p>
              <p className="mt-1 text-xs text-slate-500">選択中: {selectedCategoryLabel}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {directCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => selectCategory(category.slug)}
                    className={categoryButtonClass(categorySlug === category.slug)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setSpecializedOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800"
                >
                  専門科目
                  {specializedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {specializedOpen ? (
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {specializedCategories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => selectCategory(category.slug)}
                        className={categoryButtonClass(categorySlug === category.slug)}
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
                  onClick={() => setSecondLanguageOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800"
                >
                  第二外国語
                  {secondLanguageOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {secondLanguageOpen ? (
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                    {secondLanguageCategories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => selectCategory(category.slug)}
                        className={categoryButtonClass(categorySlug === category.slug)}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">時間割CSV</p>
              <p className="mt-1 text-sm text-slate-500">
                対応範囲：{selectedCategoryLabel}の時間割CSV（年度,学期,曜日,時限,科目名,担当教員,授業コード,講義室の列を想定。UTF-8/Shift-JIS両対応）
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

            {categorySlug === 'general-education' || categorySlug === 'foundation-list' ? (
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
            ) : null}

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
