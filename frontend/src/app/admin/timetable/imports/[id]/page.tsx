'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth-context';
import {
  getApiErrorMessage,
  getAdminTimetableImport,
  publishAdminTimetableImport,
  updateAdminTimetableImportRows,
  type TimetableImportBatch,
  type TimetableImportRowInput,
} from '@/lib/api';

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

const termLabels: Record<string, string> = { spring: '前期', fall: '後期', intensive: '集中', year: '通年' };

interface EditableRow {
  key: string;
  day: string; // select値としては文字列で保持
  period: string;
  course_code: string;
  course_name: string;
  instructor: string;
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
    classroom: '',
    note: '',
  };
}

function toEditableRows(batch: TimetableImportBatch): EditableRow[] {
  return (batch.rows ?? []).map((row) => ({
    key: String(row.import_row_id),
    day: row.day != null ? String(row.day) : '',
    period: row.period != null ? String(row.period) : '',
    course_code: row.course_code,
    course_name: row.course_name,
    instructor: row.instructor,
    classroom: row.classroom,
    note: row.note,
  }));
}

function toRowInputs(rows: EditableRow[]): TimetableImportRowInput[] {
  return rows.map((row) => ({
    day: row.day === '' ? null : Number(row.day),
    period: row.period === '' ? null : Number(row.period),
    course_code: row.course_code.trim(),
    course_name: row.course_name.trim(),
    instructor: row.instructor.trim(),
    classroom: row.classroom.trim(),
    note: row.note.trim(),
  }));
}

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-[#2b4dca] focus:ring-1 focus:ring-[#2b4dca]/30 disabled:bg-slate-50 disabled:text-slate-400';

export default function TimetableImportEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getIdToken } = useAuth();
  const batchId = Number(params.id);

  const [batch, setBatch] = useState<TimetableImportBatch | null>(null);
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const idToken = await getIdToken();
      const res = await getAdminTimetableImport(idToken, batchId);
      setBatch(res);
      setRows(toEditableRows(res));
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, 'インポートデータの取得に失敗しました。') });
    } finally {
      setLoading(false);
    }
  }, [getIdToken, batchId]);

  useEffect(() => {
    load();
  }, [load]);

  const isPublished = batch?.status === 'published';

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
    setSaving(true);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      const updated = await updateAdminTimetableImportRows(idToken, batchId, toRowInputs(rows));
      setBatch(updated);
      setRows(toEditableRows(updated));
      setMessage({ tone: 'success', text: '保存しました。' });
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, '保存に失敗しました。') });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      // 公開前に未保存の修正を確実に反映する（公開済みバッチは行を編集できないため対象外）
      if (!isPublished) {
        await updateAdminTimetableImportRows(idToken, batchId, toRowInputs(rows));
      }
      const published = await publishAdminTimetableImport(idToken, batchId);
      setBatch(published);
      setRows(toEditableRows(published));
      setMessage({ tone: 'success', text: '公開しました。ユーザー画面の総合教養科目に反映されています。' });
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, '公開に失敗しました。') });
    } finally {
      setPublishing(false);
    }
  };

  const summary = useMemo(() => {
    if (!batch) return '';
    return `${batch.academic_year}年度 ${termLabels[batch.term] ?? batch.term} ／ ${rows.length}件`;
  }, [batch, rows.length]);

  return (
    <AdminLayout
      currentPath="/admin/timetable"
      title="時間割インポートの編集"
      subtitle="PDFから自動で読み取った内容です。誤りがあれば直接修正し、確認できたら公開してください。"
    >
      {loading ? (
        <p className="text-sm text-slate-500">読み込み中...</p>
      ) : !batch ? (
        <p className="text-sm text-red-600">インポートデータが見つかりませんでした。</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{summary}</p>
              <p className="mt-1 text-sm text-slate-500">
                元ファイル: {batch.source_filename || '-'} ／ ステータス:{' '}
                <span className={isPublished ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
                  {isPublished ? '公開済み' : '下書き（未公開）'}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/admin/timetable')}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                一覧へ戻る
              </button>
              {batch.sheet_provider === 'google_sheets' && batch.sheet_url && (
                <a
                  href={batch.sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Googleスプレッドシートで開く
                </a>
              )}
              {!isPublished && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full border border-[#2b4dca] bg-white px-5 py-2 text-sm font-semibold text-[#2b4dca] transition hover:bg-[#eff3ff] disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              )}
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing || rows.length === 0}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {publishing ? '公開中...' : isPublished ? '再公開する' : '公開する'}
              </button>
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

          {isPublished ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              公開済みのため表のみ参照できます。内容を変更したい場合はPDFを再アップロードしてください。
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                  <th className="w-20 border-b border-slate-200 px-3 py-2">曜日</th>
                  <th className="w-24 border-b border-slate-200 px-3 py-2">時限</th>
                  <th className="w-32 border-b border-slate-200 px-3 py-2">授業コード</th>
                  <th className="border-b border-slate-200 px-3 py-2">科目名称</th>
                  <th className="w-40 border-b border-slate-200 px-3 py-2">代表教員</th>
                  <th className="w-40 border-b border-slate-200 px-3 py-2">講義室</th>
                  <th className="w-28 border-b border-slate-200 px-3 py-2">備考</th>
                  {!isPublished && <th className="w-12 border-b border-slate-200 px-2 py-2" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-1.5">
                      <select
                        value={row.day}
                        disabled={isPublished}
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
                        disabled={isPublished}
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
                        disabled={isPublished}
                        onChange={(e) => updateRow(row.key, { course_code: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={row.course_name}
                        disabled={isPublished}
                        onChange={(e) => updateRow(row.key, { course_name: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={row.instructor}
                        disabled={isPublished}
                        onChange={(e) => updateRow(row.key, { instructor: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={row.classroom}
                        disabled={isPublished}
                        onChange={(e) => updateRow(row.key, { classroom: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={row.note}
                        disabled={isPublished}
                        onChange={(e) => updateRow(row.key, { note: e.target.value })}
                        className={inputClass}
                      />
                    </td>
                    {!isPublished && (
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isPublished && (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              + 行を追加
            </button>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
