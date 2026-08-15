'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { getApiErrorMessage, getDefaultTerm, updateAdminDefaultTerm } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const termChoices: { key: 'auto' | 'spring' | 'fall'; label: string; description: string }[] = [
  { key: 'auto', label: '自動（カレンダー基準）', description: '4〜9月は前期、10〜3月は後期を自動で表示します。' },
  { key: 'spring', label: '前期に固定', description: '月に関わらず、常に前期の時間割を表示します。' },
  { key: 'fall', label: '後期に固定', description: '月に関わらず、常に後期の時間割を表示します。' },
];

export default function SettingsPage() {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<'auto' | 'spring' | 'fall'>('auto');
  const [effectiveTerm, setEffectiveTerm] = useState<'spring' | 'fall' | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getDefaultTerm();
      setSelected(res.is_override ? res.term : 'auto');
      setEffectiveTerm(res.term);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, '現在の設定を取得できませんでした。'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (next: 'auto' | 'spring' | 'fall') => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const idToken = await getIdToken();
      const res = await updateAdminDefaultTerm(idToken, next);
      setSelected(next);
      setEffectiveTerm(res.term);
      setSuccessMessage('ユーザー画面の表示学期を更新しました。');
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, '設定の更新に失敗しました。'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      currentPath="/admin/settings"
      title="サイト設定"
      subtitle="ユーザー画面の時間割にデフォルトで表示する学期を切り替えられます。"
    >
      <div className="space-y-6">
        {loading ? (
          <AdminLoadingBlock rows={2} />
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              現在ユーザー画面に表示されている学期:{' '}
              <span className="text-[#2b4dca]">{effectiveTerm === 'fall' ? '後期' : '前期'}</span>
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {termChoices.map((choice) => (
                <button
                  key={choice.key}
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(choice.key)}
                  className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected === choice.key
                      ? 'border-[#2b4dca] bg-white shadow-sm ring-2 ring-[#2b4dca]'
                      : 'border-slate-200 bg-white hover:border-[#2b4dca]'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{choice.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{choice.description}</p>
                </button>
              ))}
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
