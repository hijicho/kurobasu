'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CalendarRange, ChevronRight, LogOut, Megaphone, MessageSquareText, ShieldUser, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
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
  { href: '/admin/reviews', label: '口コミ', icon: MessageSquareText, visibleRoles: ['admin', 'editor'] },
  { href: '/admin/ads', label: '広告', icon: Megaphone, visibleRoles: ['admin', 'editor'] },
  { href: '/admin/timetable', label: '時間割', icon: CalendarRange, visibleRoles: ['admin', 'editor'] },
  { href: '/admin/users', label: '管理人', icon: ShieldUser, visibleRoles: ['admin'] },
  { href: '/logout', label: 'ログアウト', icon: LogOut, visibleRoles: ['admin', 'editor'] },
];

function isAdminRole(role: string | null): role is Role {
  return role === 'admin' || role === 'editor';
}

export default function AdminLayout({ children, currentPath, title, subtitle }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useAdminRole();

  // ロールはバックエンドの /me（DB の users.role）が唯一の情報源。
  // フロント側で自由に切り替えることはできない。
  const resolving = authLoading || (isAuthenticated && roleLoading);
  const hasAdminAccess = isAdminRole(role);

  useEffect(() => {
    if (resolving) {
      return;
    }
    if (!isAuthenticated || !hasAdminAccess) {
      router.replace('/login');
    }
  }, [resolving, isAuthenticated, hasAdminAccess, router]);

  if (resolving || !isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        読み込み中...
      </div>
    );
  }

  const currentItem = navigationItems.find((item) => item.href === currentPath);
  const canViewCurrentPage = !currentItem || currentItem.visibleRoles.includes(role as Role);

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
              const isVisible = item.visibleRoles.includes(role as Role);
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

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              ロール: <span className="font-semibold text-[#2b4dca]">{role}</span>
            </div>
          </header>

          {canViewCurrentPage ? (
            children
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 text-sm text-slate-600 shadow-sm">
              この画面へのアクセス権がありません。
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
