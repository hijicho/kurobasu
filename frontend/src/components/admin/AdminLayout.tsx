'use client';

import Link from 'next/link';
import { CalendarRange, ChevronRight, LogOut, Megaphone, MessageSquareText, ShieldUser, Sparkles } from 'lucide-react';
import { useAdminRole } from '@/lib/admin-role-context';

type AdminLayoutProps = {
  children: React.ReactNode;
  currentPath: string;
  title: string;
  subtitle?: string;
};

type Role = 'admin' | 'editor';

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  visibleRoles: Role[];
};

const navigationItems: NavigationItem[] = [
  { href: '/admin', label: '使い方', icon: Sparkles, visibleRoles: ['admin', 'editor'] },
  { href: '/reviews', label: '口コミ', icon: MessageSquareText, visibleRoles: ['admin', 'editor'] },
  { href: '/ads', label: '広告', icon: Megaphone, visibleRoles: ['admin', 'editor'] },
  { href: '/timetable', label: '時間割', icon: CalendarRange, visibleRoles: ['admin', 'editor'] },
  { href: '/admin-management', label: '管理人', icon: ShieldUser, visibleRoles: ['admin'] },
  { href: '/logout', label: 'ログアウト', icon: LogOut, visibleRoles: ['admin', 'editor'] },
];

export default function AdminLayout({ children, currentPath, title, subtitle }: AdminLayoutProps) {
  const { role, setRole } = useAdminRole();

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
              const isVisible = item.visibleRoles.includes(role);
              if (!isVisible) {
                return null;
              }

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
        </aside>

        <main className="flex-1 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2b4dca]">管理画面</p>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-600">ロール切り替え</span>
              <div className="flex rounded-full bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    role === 'admin' ? 'bg-[#2b4dca] text-white' : 'text-slate-600'
                  }`}
                >
                  admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('editor')}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    role === 'editor' ? 'bg-[#2b4dca] text-white' : 'text-slate-600'
                  }`}
                >
                  editor
                </button>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
