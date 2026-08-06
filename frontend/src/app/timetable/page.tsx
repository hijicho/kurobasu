'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const rows = [
  ['月', '情報基礎', 'A101'],
  ['火', '英語', 'A202'],
  ['水', '総合演習', 'B305'],
];

export default function TimetablePage() {
  const [isHistoryView, setIsHistoryView] = useState(false);

  return (
    <AdminLayout currentPath="/timetable" title="時間割" subtitle="PDFアップロードまたは過去年度の表を確認できます。">
      <div className="space-y-6">
        {!isHistoryView ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
              <p className="text-lg font-semibold text-slate-800">ここにPDFをドラッグ</p>
              <p className="mt-2 text-sm text-slate-500">アップロードすると、最新の時間割を反映できます。</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">年次選択</span>
                <select className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none">
                  <option>2026年度後期</option>
                  <option>2027年度前期</option>
                  <option>2027年度後期</option>
                </select>
              </label>

              <button type="button" className="rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white">
                決定
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsHistoryView(true)}
              className="mt-6 rounded-full bg-black px-6 py-2 text-sm font-semibold text-white"
            >
              過去の年度
            </button>
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2b4dca]">過去の年度</p>
                <p className="text-sm text-slate-600">エクセルのような表で履歴を確認できます。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryView(false)}
                className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white"
              >
                戻る
              </button>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">曜日</th>
                    <th className="px-4 py-3">授業名</th>
                    <th className="px-4 py-3">教室</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row[0]} className="border-t border-slate-100">
                      {row.map((cell) => (
                        <td key={cell} className="px-4 py-3 text-slate-600">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
