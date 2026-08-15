'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarRange, ChevronRight, LogOut, Megaphone, MessageSquareText, ShieldUser, Sparkles, UserRound } from 'lucide-react';
import { getApiErrorMessage, getMe, type UserProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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
  { href: '/admin/users', label: '管理人', icon: ShieldUser },
  { href: '/logout', label: 'ログアウト', icon: LogOut },
];

const roleLabels: Record<string, string> = {
  admin: '管理人',
  editor: '編集委員',
  user: '一般ユーザー',
};

export default function AdminLayout({ children, currentPath, title, subtitle }: AdminLayoutProps) {
  const { getIdToken } = useAuth();
  const [me, setMe] = useState<UserProfile | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      setMeError(null);
      try {
        const idToken = await getIdToken();
        const profile = await getMe(idToken);
        if (!cancelled) {
          setMe(profile);
        }
      } catch (err) {
        if (!cancelled) {
          setMe(null);
          setMeError(getApiErrorMessage(err, 'ユーザー情報を取得できませんでした。'));
        }
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [getIdToken]);

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
                <p className="truncate font-semibold text-white">{me.display_name || '名前未設定'}</p>
                <div className="flex items-center justify-between gap-3 text-blue-100">
                  <span>ロール</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#2b4dca]">
                    {roleLabels[me.role] ?? me.role}
                  </span>
                </div>
                <p className="text-xs text-blue-100">User ID: {me.user_id}</p>
              </div>
            ) : (
              <p className="text-sm text-blue-100">{meError ?? 'ユーザー情報を読み込んでいます。'}</p>
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

          {children}
        </main>
      </div>
    </div>
  );
}
