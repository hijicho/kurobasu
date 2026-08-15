'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage, listAdminUsers, updateUserRole, type UserProfile } from '@/lib/api';

const roleOptions = [
  { value: 'admin', label: '管理人' },
  { value: 'editor', label: '編集委員' },
  { value: 'user', label: '一般ユーザー' },
] as const;

type RoleValue = (typeof roleOptions)[number]['value'];

export default function AdminManagementPage() {
  const { getIdToken } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await getIdToken();
      const res = await listAdminUsers(idToken);
      setUsers(res.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'ユーザー一覧の取得に失敗しました。'));
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  return (
    <AdminLayout
      currentPath="/admin/users"
      title="ユーザー権限"
      subtitle="ユーザーのロールを変更します。許可されない操作はAPIが拒否します。"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-4 shadow-sm">
          <div>
            <p className="text-lg font-semibold text-slate-900">ユーザー一覧</p>
            <p className="text-sm text-slate-600">管理人・編集委員・一般ユーザーを選択できます。</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.user_id} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.display_name}</p>
                    <p className="mt-1 text-sm text-slate-600">ロール: {user.role}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        disabled={updatingUserId === user.user_id || user.role === role.value}
                        onClick={() => handleRoleChange(user.user_id, role.value)}
                        className={`rounded-full px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                          role.value === 'admin'
                            ? 'bg-slate-900 text-white'
                            : role.value === 'editor'
                              ? 'bg-[#2b4dca] text-white'
                              : 'bg-white text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
