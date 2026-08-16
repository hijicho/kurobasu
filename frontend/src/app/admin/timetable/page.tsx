'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import {
  getApiErrorMessage,
  getSiteSettings,
  importAdminTimetableRowsCSV,
  listAdminTimetableRows,
  saveAdminTimetableRows,
  type TimetableRow,
} from '@/lib/api';
import { publicCategoryPath } from '@/lib/public-routing';

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

function isCsvFile(file: File) {
  return (
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.toLowerCase().endsWith('.csv')
  );
}

const dayOptions = [
  { value: '', label: '未定' },
  { value: '1', label: '月' },
  { value: '2', label: '火' },
  { value: '3', label: '水' },
  { value: '4', label: '木' },
  { value: '5', label: '金' },
];

const periodOptions = [
  { value: '', label: '未定' },
  { value: '1', label: '1限' },
  { value: '2', label: '2限' },
  { value: '3', label: '3限' },
  { value: '4', label: '4限' },
  { value: '5', label: '5限' },
];

interface EditableRow {
  key: string;
  offeringId?: number;
  day: string; // select値としては文字列で保持
  period: string;
  course_code: string;
  course_name: string;
  instructor: string;
  campus: string;
  classroom: string;
  note: string;
}

let nextTempKey = 0;
function makeEmptyRow(): EditableRow {
  nextTempKey += 1;
  return {
    key: `new-${nextTempKey}`,
    day: '',
    period: '',
    course_code: '',
    course_name: '',
    instructor: '',
    campus: '',
    classroom: '',
    note: '',
  };
}

function toEditableRows(rows: TimetableRow[]): EditableRow[] {
  return rows.map((row, i) => ({
    key: row.offering_id != null ? `${row.offering_id}-${i}` : `new-${i}`,
    offeringId: row.offering_id,
    day: row.day != null ? String(row.day) : '',
    period: row.period != null ? String(row.period) : '',
    course_code: row.course_code,
    course_name: row.course_name,
    instructor: row.instructor,
    campus: row.campus,
    classroom: row.classroom,
    note: row.note,
  }));
}

function toRowInputs(rows: EditableRow[]): TimetableRow[] {
  return rows.map((row) => ({
    day: row.day === '' ? null : Number(row.day),
    period: row.period === '' ? null : Number(row.period),
    course_code: row.course_code.trim(),
    course_name: row.course_name.trim(),
    instructor: row.instructor.trim(),
    campus: row.campus.trim(),
    classroom: row.classroom.trim(),
    note: row.note.trim(),
  }));
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#2b4dca] focus:ring-1 focus:ring-[#2b4dca]/30';

export default function TimetablePage() {
  const { getIdToken } = useAuth();

  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());
  const [term, setTerm] = useState(termOptions[0].key);
  const [categorySlug, setCategorySlug] = useState(directCategories[0].slug);
  const [specializedOpen, setSpecializedOpen] = useState(false);
  const [secondLanguageOpen, setSecondLanguageOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [intensiveCsvFile, setIntensiveCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const intensiveFileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const selectedCategoryLabel =
    allCategories.find((category) => category.slug === categorySlug)?.label ?? categorySlug;
  const selectedTermLabel = termOptions.find((t) => t.key === term)?.label ?? term;

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

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    try {
      const idToken = await getIdToken();
      const res = await listAdminTimetableRows(idToken, categorySlug, academicYear, term);
      setRows(toEditableRows(res.items));
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, '授業データの取得に失敗しました。') });
    } finally {
      setLoadingRows(false);
    }
  }, [getIdToken, categorySlug, academicYear, term]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const selectCategory = (slug: string) => {
    setCategorySlug(slug);
    setCsvFile(null);
    setIntensiveCsvFile(null);
    setMessage(null);
  };

  const handleFile = (file: File) => {
    if (!isCsvFile(file)) {
      setMessage({ tone: 'error', text: 'CSVファイルを選択してください。' });
      return;
    }
    setCsvFile(file);
    setMessage(null);
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
      setMessage({ tone: 'error', text: 'CSVファイルを選択してください。' });
      return;
    }
    setIntensiveCsvFile(file);
    setMessage(null);
  };

  const confirmReplace = () =>
    window.confirm(
      `「${selectedCategoryLabel}」の${academicYear}年度${selectedTermLabel}の授業データを全て置き換えます。既存の授業に投稿された評価（おすすめ度）はすべて削除されます。よろしいですか？`
    );

  const runImport = async (csv: File | null, intensive: File | null) => {
    if (!confirmReplace()) return;

    setMessage(null);
    setUploading(true);
    try {
      const idToken = await getIdToken();
      const res = await importAdminTimetableRowsCSV(idToken, academicYear, term, csv, categorySlug, intensive);
      setRows(toEditableRows(res.items));
      setCsvFile(null);
      setIntensiveCsvFile(null);
      setMessage({ tone: 'success', text: `取り込みました（${res.items.length}件）。` });
    } catch (err) {
      console.error('Failed to import timetable CSV:', err);
      setMessage({
        tone: 'error',
        text: getApiErrorMessage(
          err,
          `CSVの取り込みに失敗しました。${selectedCategoryLabel}の時間割CSVであることを確認するか、しばらくしてから再度お試しください。`
        ),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (!csvFile) {
      setMessage({ tone: 'error', text: 'CSVを選択してください。' });
      return;
    }
    runImport(csvFile, intensiveCsvFile);
  };

  // 時間割CSVは既に取り込み済みで、集中講義だけ後から追加したい場合。
  // 現在保存されているデータに、この集中講義CSVをマージして置き換える
  // （元の時間割CSVを選び直す必要はない）。
  const handleAddIntensive = () => {
    if (!intensiveCsvFile) {
      setMessage({ tone: 'error', text: '集中講義のCSVを選択してください。' });
      return;
    }
    runImport(null, intensiveCsvFile);
  };

  const updateRow = (key: string, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeEmptyRow()]);
  };

  const handleSave = async () => {
    if (!confirmReplace()) return;

    setMessage(null);
    setSaving(true);
    try {
      const idToken = await getIdToken();
      const res = await saveAdminTimetableRows(idToken, categorySlug, academicYear, term, toRowInputs(rows));
      setRows(toEditableRows(res.items));
      setMessage({ tone: 'success', text: '保存しました。' });
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, '保存に失敗しました。') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/timetable"
      title="時間割"
      subtitle="カテゴリ・年度・学期を選ぶと、現在公開中の授業データを直接編集できます。CSVをアップロードすると、その内容で丸ごと置き換わります。"
    >
      <div className="space-y-6">
        <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-900">対象のカテゴリ</p>
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

          <div className="grid gap-4 md:grid-cols-2 md:items-end">
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
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">時間割CSVで丸ごと置き換え</p>
            <p className="mt-1 text-sm text-slate-500">
              対応範囲：{selectedCategoryLabel}の時間割CSV（年度,学期,曜日,時限,科目名,担当教員,授業コード,講義室の列を想定。UTF-8/Shift-JIS両対応）
            </p>
            <input ref={fileInputRef} type="file" accept="text/csv,.csv" className="hidden" onChange={handleFileChange} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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

            <button
              type="button"
              onClick={handleUpload}
              disabled={!csvFile || uploading}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {uploading ? '取り込み中...' : 'CSVを取り込んで置き換え'}
            </button>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">集中講義のCSV（任意）</p>
              <p className="mt-1 text-sm text-slate-500">
                日付指定で開講される集中講義がある場合は、上のCSVと合わせて選択するか、
                下のボタンで既存データに追加できます。
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

              <button
                type="button"
                onClick={handleAddIntensive}
                disabled={!intensiveCsvFile || uploading}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-[#2b4dca] bg-white px-5 py-2 text-sm font-semibold text-[#2b4dca] transition hover:bg-[#eff3ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? '取り込み中...' : '既存データに集中講義CSVを追加'}
              </button>
              <p className="mt-2 text-xs text-slate-400">
                上の「時間割CSV」を選ばずにこのボタンだけを押すと、現在保存されている{selectedCategoryLabel}の
                {academicYear}年度{selectedTermLabel}のデータに、このCSVをマージして置き換えます。
              </p>
            </div>
          </div>
        </div>

        {message ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              message.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedCategoryLabel} ／ {academicYear}年度 {selectedTermLabel} ／ {rows.length}件
              </p>
              <p className="mt-1 text-sm text-slate-500">現在公開中の授業データです。直接編集して保存できます。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={publicCategoryPath(academicYear, term, categorySlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                画面を確認
              </a>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loadingRows}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {loadingRows ? (
            <AdminLoadingBlock rows={3} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[1080px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                      <th className="w-20 border-b border-slate-200 px-3 py-2">曜日</th>
                      <th className="w-24 border-b border-slate-200 px-3 py-2">時限</th>
                      <th className="w-32 border-b border-slate-200 px-3 py-2">授業コード</th>
                      <th className="border-b border-slate-200 px-3 py-2">科目名称</th>
                      <th className="w-40 border-b border-slate-200 px-3 py-2">代表教員</th>
                      <th className="w-32 border-b border-slate-200 px-3 py-2">実施キャンパス</th>
                      <th className="w-40 border-b border-slate-200 px-3 py-2">講義室</th>
                      <th className="w-28 border-b border-slate-200 px-3 py-2">備考</th>
                      <th className="w-12 border-b border-slate-200 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-b border-slate-100 last:border-0">
                        <td className="px-2 py-1.5">
                          <select
                            value={row.day}
                            onChange={(e) => updateRow(row.key, { day: e.target.value })}
                            className={inputClass}
                          >
                            {dayOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <select
                            value={row.period}
                            onChange={(e) => updateRow(row.key, { period: e.target.value })}
                            className={inputClass}
                          >
                            {periodOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.course_code}
                            onChange={(e) => updateRow(row.key, { course_code: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.course_name}
                            onChange={(e) => updateRow(row.key, { course_name: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.instructor}
                            onChange={(e) => updateRow(row.key, { instructor: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.campus}
                            onChange={(e) => updateRow(row.key, { campus: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.classroom}
                            onChange={(e) => updateRow(row.key, { classroom: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            value={row.note}
                            onChange={(e) => updateRow(row.key, { note: e.target.value })}
                            className={inputClass}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(row.key)}
                            className="text-slate-400 transition hover:text-red-600"
                            aria-label="この行を削除"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                + 行を追加
              </button>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
