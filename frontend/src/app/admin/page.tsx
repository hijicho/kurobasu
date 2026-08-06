import AdminLayout from '@/components/admin/AdminLayout';

const guideItems = [
  { menu: '口コミ', description: '口コミについて、承認・削除ができます。' },
  { menu: '広告', description: '掲載する広告の更新・削除ができます。' },
  { menu: '時間割', description: '時間割の PDF を使用することで、最新版の時間割が作成できます。' },
  { menu: 'ログアウト', description: 'ログアウトができます。' },
];

export default function Page() {
  return (
    <AdminLayout currentPath="/admin" title="管理画面の使い方" subtitle="各機能の説明を確認して、運用に入ります。">
      <div className="grid gap-4">
        {guideItems.map((item) => (
          <div key={item.menu} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">{item.menu}</p>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
