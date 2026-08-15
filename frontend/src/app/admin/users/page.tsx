'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage, listAdminUsers, updateUserRole, type UserProfile } from '@/lib/api';

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

  const handleRoleChange = async (userId: number, role: 'editor' | 'user') => {
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
      title="編集委員一覧 / 編集委員追加"
      subtitle="管理人のみが編集委員の権限を管理できます。"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-4 shadow-sm">
          <div>
            <p className="text-lg font-semibold text-slate-900">ユーザー一覧</p>
            <p className="text-sm text-slate-600">編集委員の権限付与・取消ができます。</p>
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
                  {user.role === 'admin' ? (
                    <span className="text-sm text-slate-400">管理人はここから変更できません</span>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={updatingUserId === user.user_id || user.role === 'editor'}
                        onClick={() => handleRoleChange(user.user_id, 'editor')}
                        className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        権限付与
                      </button>
                      <button
                        type="button"
                        disabled={updatingUserId === user.user_id || user.role === 'user'}
                        onClick={() => handleRoleChange(user.user_id, 'user')}
                        className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
