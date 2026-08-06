import AdminLayout from '@/components/admin/AdminLayout';

const reviews = [
  {
    date: '2026年度 後期',
    content: '口コミ内容テキスト',
    status: '未確認',
  },
  {
    date: '2026年度 前期',
    content: 'UIが使いやすく、掲載情報が整理されていて助かります。',
    status: '未確認',
  },
];

export default function ReviewsPage() {
  return (
    <AdminLayout currentPath="/reviews" title="口コミ" subtitle="口コミを確認して承認・削除できます。">
      <div className="space-y-4">
        {reviews.map((item) => (
          <div key={item.date} className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2b4dca]">{item.date}</p>
                <p className="mt-2 text-sm text-slate-700">{item.content}</p>
                <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {item.status}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white">
                  承認
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
