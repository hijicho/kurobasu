'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldUser, UserRound } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLoadingBlock from '@/components/admin/AdminLoadingBlock';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage, listAdminUsers, updateUserRole, type UserProfile } from '@/lib/api';

const roleOptions = [
  { value: 'admin', label: '管理人', description: '全機能と権限管理' },
  { value: 'editor', label: '編集委員', description: '口コミ・広告・時間割' },
  { value: 'user', label: '一般ユーザー', description: '管理画面なし' },
] as const;

type RoleValue = (typeof roleOptions)[number]['value'];
type RoleFilter = RoleValue | 'all';

const roleLabels = Object.fromEntries(roleOptions.map((role) => [role.value, role.label])) as Record<RoleValue, string>;

const roleBadgeClass: Record<RoleValue, string> = {
  admin: 'bg-slate-900 text-white',
  editor: 'bg-[#2b4dca] text-white',
  user: 'bg-white text-slate-600 ring-1 ring-slate-200',
};

const roleIcons: Record<RoleValue, typeof ShieldCheck> = {
  admin: ShieldCheck,
  editor: ShieldUser,
  user: UserRound,
};

export default function AdminManagementPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleCounts, setRoleCounts] = useState<Record<RoleFilter, number>>({ all: 0, admin: 0, editor: 0, user: 0 });
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const res = await listAdminUsers(idToken, {
        role: roleFilter === 'all' ? undefined : roleFilter,
        query: searchQuery || undefined,
      });
      const counts = res.role_counts ?? {};
      const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);
      setUsers(res.items);
      setTotalCount(allCount);
      setRoleCounts({
        all: allCount,
        admin: counts.admin ?? 0,
        editor: counts.editor ?? 0,
        user: counts.user ?? 0,
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'ユーザー一覧の取得に失敗しました。'));
    } finally {
      setLoading(false);
    }
  }, [getIdToken, roleFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timerId);
  }, [searchInput]);

  const handleRoleChange = async (userId: number, role: RoleValue) => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const idToken = await getIdToken();
      await updateUserRole(idToken, userId, role);
      await loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err, 'ロールの更新に失敗しました。'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filterOptions: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'すべて' },
    ...roleOptions.map((role) => ({ value: role.value, label: role.label })),
  ];

  return (
    <AdminLayout
      currentPath="/admin/users"
      title="ユーザー権限"
      subtitle="ユーザーのロールを変更します。許可されない操作はAPIが拒否します。"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">ユーザー一覧</p>
            <p className="text-sm text-slate-600">
              {users.length} / {totalCount} 件を表示中
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="名前・メール・User IDで検索"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2b4dca] lg:w-72"
            />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRoleFilter(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    roleFilter === option.value
                      ? 'bg-[#2b4dca] text-white'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                  <span className={roleFilter === option.value ? 'ml-2 text-blue-100' : 'ml-2 text-slate-400'}>
                    {roleCounts[option.value]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <AdminLoadingBlock rows={3} />
        ) : (
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8f9fa] shadow-sm">
            <div className="grid grid-cols-1 gap-3 border-b border-slate-200 bg-white px-5 py-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 md:grid-cols-[1.5fr_160px_220px]">
              <span>ユーザー</span>
              <span>現在のロール</span>
              <span>変更</span>
            </div>

            {users.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                条件に一致するユーザーはいません。
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {users.map((user) => {
                  const role = user.role as RoleValue;
                  const RoleIcon = roleIcons[role] ?? UserRound;
                  const updating = updatingUserId === user.user_id;

                  return (
                    <div
                      key={user.user_id}
                      className={`grid grid-cols-1 gap-4 px-5 py-4 transition md:grid-cols-[1.5fr_160px_220px] md:items-center ${
                        updating ? 'bg-white/70 opacity-70' : 'bg-[#f8f9fa]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2b4dca] ring-1 ring-slate-200">
                            <UserRound className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.display_name || '名前未設定'}
                            </p>
                            <p className="truncate text-sm text-slate-600">{user.email ?? 'メール未設定'}</p>
                            <p className="mt-0.5 text-xs text-slate-400">User ID: {user.user_id}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            roleBadgeClass[role] ?? roleBadgeClass.user
                          }`}
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                          {roleLabels[role] ?? user.role}
                        </span>
                      </div>

                      <div>
                        <select
                          value={user.role}
                          disabled={updating}
                          onChange={(event) => handleRoleChange(user.user_id, event.target.value as RoleValue)}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#2b4dca] disabled:cursor-wait disabled:opacity-60"
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
