'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarRange, Check, ChevronRight, LogOut, Megaphone, MessageSquareText, Pencil, Settings, ShieldUser, Sparkles, UserRound, X } from 'lucide-react';
import { ApiError, getAdminMe, getApiErrorMessage, updateMe, type UserProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import AdminLoadingBlock from './AdminLoadingBlock';

type AdminLayoutProps = {
  children: React.ReactNode;
  currentPath: string;
  title: string;
  subtitle?: string;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
};

const navigationItems: NavigationItem[] = [
  { href: '/admin', label: '使い方', icon: Sparkles },
  { href: '/admin/reviews', label: '口コミ', icon: MessageSquareText },
  { href: '/admin/ads', label: '広告', icon: Megaphone },
  { href: '/admin/timetable', label: '時間割', icon: CalendarRange },
  { href: '/admin/settings', label: '公開設定', icon: Settings },
  { href: '/admin/users', label: '管理人', icon: ShieldUser },
  { href: '/logout', label: 'ログアウト', icon: LogOut },
];

const roleLabels: Record<string, string> = {
  admin: '管理人',
  editor: '編集委員',
  user: '一般ユーザー',
};

type AdminProfileCache = {
  profile: UserProfile | null;
  error: string | null;
  errorStatus: number | null;
  checked: boolean;
};

let adminProfileCache: AdminProfileCache = {
  profile: null,
  error: null,
  errorStatus: null,
  checked: false,
};

export default function AdminLayout({ children, currentPath, title, subtitle }: AdminLayoutProps) {
  const { getIdToken } = useAuth();
  const [me, setMe] = useState<UserProfile | null>(adminProfileCache.profile);
  const [meError, setMeError] = useState<string | null>(adminProfileCache.error);
  const [meErrorStatus, setMeErrorStatus] = useState<number | null>(adminProfileCache.errorStatus);
  const [checkingAccess, setCheckingAccess] = useState(!adminProfileCache.checked);
  const [editingName, setEditingName] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const accessDenied = !checkingAccess && !me;
  const loginRequired = meErrorStatus === 401;

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      setMeError(null);
      setMeErrorStatus(null);
      if (!adminProfileCache.checked) {
        setCheckingAccess(true);
      }
      try {
        const idToken = await getIdToken();
        const profile = await getAdminMe(idToken);
        adminProfileCache = {
          profile,
          error: null,
          errorStatus: null,
          checked: true,
        };
        if (!cancelled) {
          setMe(profile);
          setDisplayNameDraft(profile.display_name);
          setMeError(null);
          setMeErrorStatus(null);
        }
      } catch (err) {
        const error = getApiErrorMessage(err, 'ユーザー情報を取得できませんでした。');
        const errorStatus = err instanceof ApiError ? err.status : null;
        adminProfileCache = {
          profile: null,
          error,
          errorStatus,
          checked: true,
        };
        if (!cancelled) {
          setMe(null);
          setMeErrorStatus(errorStatus);
          setMeError(error);
        }
      } finally {
        if (!cancelled) {
          setCheckingAccess(false);
        }
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [getIdToken]);

  const startEditingName = () => {
    if (!me) return;
    setDisplayNameDraft(me.display_name);
    setProfileMessage(null);
    setEditingName(true);
  };

  const cancelEditingName = () => {
    setDisplayNameDraft(me?.display_name ?? '');
    setProfileMessage(null);
    setEditingName(false);
  };

  const saveDisplayName = async () => {
    const nextName = displayNameDraft.trim();
    if (!nextName) {
      setProfileMessage({ tone: 'error', text: '表示名を入力してください。' });
      return;
    }

    setSavingName(true);
    setProfileMessage(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new ApiError(401, 'Authorization header required');
      }
      const updated = await updateMe(idToken, nextName);
      adminProfileCache = {
        profile: updated,
        error: null,
        errorStatus: null,
        checked: true,
      };
      setMe(updated);
      setDisplayNameDraft(updated.display_name);
      setEditingName(false);
      setProfileMessage({ tone: 'success', text: '表示名を更新しました。' });
    } catch (err) {
      setProfileMessage({ tone: 'error', text: getApiErrorMessage(err, '表示名の更新に失敗しました。') });
    } finally {
      setSavingName(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:p-8">
        <aside className="w-full shrink-0 rounded-[24px] bg-[#2b4dca] p-6 text-white shadow-[0_20px_60px_rgba(43,77,202,0.2)] lg:w-72">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-white/15 p-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">クロバス 管理画面</p>
              <p className="text-sm text-blue-100">運用・確認用ダッシュボード</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-full px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-white text-[#2b4dca]' : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[20px] border border-white/15 bg-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <UserRound className="h-4 w-4" />
              ログイン中
            </div>
            {me ? (
              <div className="space-y-2 text-sm">
                {editingName ? (
                  <div className="space-y-2">
                    <input
                      value={displayNameDraft}
                      onChange={(event) => setDisplayNameDraft(event.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                      maxLength={80}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveDisplayName}
                        disabled={savingName}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2b4dca] disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" />
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingName}
                        disabled={savingName}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate font-semibold text-white">{me.display_name || '名前未設定'}</p>
                    <button
                      type="button"
                      onClick={startEditingName}
                      className="rounded-full bg-white/15 p-1.5 text-white transition hover:bg-white/25"
                      aria-label="表示名を編集"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {me.email ? <p className="truncate text-xs text-blue-100">{me.email}</p> : null}
                <div className="flex items-center justify-between gap-3 text-blue-100">
                  <span>ロール</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2b4dca]">
                    {roleLabels[me.role] ?? me.role}
                  </span>
                </div>
                <p className="text-xs text-blue-100">User ID: {me.user_id}</p>
                {profileMessage ? (
                  <p className={`text-xs ${profileMessage.tone === 'error' ? 'text-red-100' : 'text-blue-100'}`}>
                    {profileMessage.text}
                  </p>
                ) : null}
              </div>
            ) : checkingAccess ? (
              <div className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded-full bg-white/25" />
                <div className="h-3 w-44 animate-pulse rounded-full bg-white/15" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-white/20" />
              </div>
            ) : (
              <p className="text-sm text-blue-100">{meError ?? 'ユーザー情報を取得できませんでした。'}</p>
            )}
          </div>
        </aside>

        <main className="flex-1 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2b4dca]">管理画面</p>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
            </div>
          </header>

          {accessDenied ? (
            <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-[#2b4dca]">管理画面</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {loginRequired ? 'ログインが必要です' : 'アクセスできません'}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{meError ?? 'この管理画面を表示する権限がありません。'}</p>
              <Link
                href={loginRequired ? '/login' : '/'}
                className="mt-5 inline-flex rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white"
              >
                {loginRequired ? 'ログインへ' : 'トップへ戻る'}
              </Link>
            </div>
          ) : checkingAccess && !me ? (
            <div className="grid gap-4">
              <AdminLoadingBlock />
              <AdminLoadingBlock rows={1} />
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
