'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { getAdminSiteSettings, getApiErrorMessage, updateAdminSiteSettings } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { publicTopPath, termLabels } from '@/lib/public-routing';

const termOptions = [
  { key: 'spring', label: '前期' },
  { key: 'fall', label: '後期' },
  { key: 'intensive', label: '集中' },
  { key: 'year', label: '通年' },
];

export default function SettingsPage() {
  const { getIdToken } = useAuth();
  const [academicYear, setAcademicYear] = useState<number>(new Date().getFullYear());
  const [term, setTerm] = useState(termOptions[0].key);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setMessage(null);
      try {
        const idToken = await getIdToken();
        const settings = await getAdminSiteSettings(idToken);
        if (!cancelled) {
          setAcademicYear(settings.default_academic_year);
          setTerm(settings.default_term);
          setUpdatedAt(settings.updated_at);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage({ tone: 'error', text: getApiErrorMessage(err, '公開設定の取得に失敗しました。') });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [getIdToken]);

  const publicPath = useMemo(() => publicTopPath(academicYear, term), [academicYear, term]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const idToken = await getIdToken();
      const settings = await updateAdminSiteSettings(idToken, academicYear, term);
      setAcademicYear(settings.default_academic_year);
      setTerm(settings.default_term);
      setUpdatedAt(settings.updated_at);
      setMessage({ tone: 'success', text: '公開設定を更新しました。' });
    } catch (err) {
      setMessage({ tone: 'error', text: getApiErrorMessage(err, '公開設定の更新に失敗しました。') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout currentPath="/admin/settings" title="公開設定" subtitle="トップページで表示する年度・学期を設定します。">
      {loading ? (
        <AdminLoadingBlock rows={3} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[160px_220px_1fr]">
              <label className="block text-sm font-semibold text-slate-700">
                年度
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={academicYear}
                  onChange={(event) => setAcademicYear(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2b4dca] focus:outline-none"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                学期
                <select
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2b4dca] focus:outline-none"
                >
                  {termOptions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">公開トップ</p>
                <Link href={publicPath} className="mt-2 inline-flex items-center gap-2 text-[#2b4dca] hover:underline">
                  {publicPath}
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <p className="mt-2 text-xs text-slate-500">
                  `/` にアクセスしたユーザーはこの年度・学期のトップへ移動します。
                </p>
              </div>
            </div>

            {message ? (
              <div
                className={`mt-4 rounded-2xl border p-4 text-sm ${
                  message.tone === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                }`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                現在の設定: {academicYear}年度 {termLabels[term] ?? term}
                {updatedAt ? ` / 更新 ${new Date(updatedAt).toLocaleString('ja-JP', { hour12: false })}` : ''}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#2b4dca] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203fb0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中' : '保存'}
              </button>
            </div>
          </section>
        </form>
      )}
    </AdminLayout>
  );
}
