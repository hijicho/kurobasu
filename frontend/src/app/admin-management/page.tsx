'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminRole } from '@/lib/admin-role-context';

const editors = [
  { name: '山田 太郎', email: 'yamada@example.com' },
  { name: '佐藤 花子', email: 'sato@example.com' },
];

export default function AdminManagementPage() {
  const { role } = useAdminRole();

  return (
    <AdminLayout currentPath="/admin-management" title="編集委員一覧 / 編集委員追加" subtitle="管理人のみが編集委員の権限を管理できます。">
      {role === 'admin' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-4 shadow-sm">
            <div>
              <p className="text-lg font-semibold text-slate-900">編集委員一覧</p>
              <p className="text-sm text-slate-600">登録済みの編集委員を確認できます。</p>
            </div>
            <button type="button" className="rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white">
              +
            </button>
          </div>

          <div className="space-y-4">
            {editors.map((editor) => (
              <div key={editor.email} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{editor.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{editor.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white">
                      権限付与
                    </button>
                    <button type="button" className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white">
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 text-sm text-slate-600 shadow-sm">
          この画面は管理人ロールでのみ表示できます。
        </div>
      )}
    </AdminLayout>
  );
}
