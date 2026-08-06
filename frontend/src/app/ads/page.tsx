import AdminLayout from '@/components/admin/AdminLayout';

const ads = [
  {
    title: '2026年度 後期',
    description: '掲載中の広告',
  },
  {
    title: '2026年度 前期',
    description: '新規広告の差し替え候補',
  },
];

export default function AdsPage() {
  return (
    <AdminLayout currentPath="/ads" title="広告" subtitle="掲載中の広告を更新または削除できます。">
      <div className="grid gap-4">
        {ads.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2b4dca]">{item.title}</p>
                <div className="mt-3 flex h-24 items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white text-sm font-medium text-slate-500">
                  {item.description}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white">
                  更新
                </button>
                <button type="button" className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white">
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
