import AdminLayout from '@/components/admin/AdminLayout';

export default function LogoutPage() {
  return (
    <AdminLayout currentPath="/logout" title="ログアウト" subtitle="ログアウトします。よろしいですか。">
      <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">
          ログアウトします。
          <br />
          本当によろしいですか？
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white">
            ログアウト
          </button>
          <button type="button" className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white">
            戻る
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
