'use client';

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const yearOptions = [
  {
    label: '2026年度 後期',
    value: '2026-fall',
    period: '2026年10月〜2027年3月',
  },
  {
    label: '2027年度 前期',
    value: '2027-spring',
    period: '2027年4月〜2027年9月',
  },
];

const historyItems = [
  {
    id: '2025-fall',
    label: '2025年度 後期',
    period: '2025年10月〜2026年3月',
    updatedAt: '2026/03/05 15:12',
    sheetUrl: 'https://example.com/sheet/2025-fall',
  },
  {
    id: '2025-spring',
    label: '2025年度 前期',
    period: '2025年4月〜2025年9月',
    updatedAt: '2025/09/01 10:45',
    sheetUrl: 'https://example.com/sheet/2025-spring',
  },
  {
    id: '2024-fall',
    label: '2024年度 後期',
    period: '2024年10月〜2025年3月',
    updatedAt: '2025/03/04 14:22',
    sheetUrl: 'https://example.com/sheet/2024-fall',
  },
];

export default function TimetablePage() {
  const [selectedYear, setSelectedYear] = useState(yearOptions[0].value);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!pdfFile) {
      setErrorMessage(null);
    }
  }, [pdfFile]);

  const selectedYearLabel = yearOptions.find((item) => item.value === selectedYear)?.label ?? '';

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFile = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage('PDFファイルを選択してください。');
      return;
    }

    setPdfFile(file);
    setErrorMessage(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleConfirm = async () => {
    if (!pdfFile) {
      setErrorMessage('PDFを選択してください。');
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setLoading(false);
    setConfirmed(true);
    setUpdatedAt(new Date().toLocaleString('ja-JP', { hour12: false }));
  };

  const handleEdit = () => {
    setConfirmed(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  return (
    <AdminLayout currentPath="/admin/timetable" title="時間割" subtitle="年度を選んでPDFをアップロードし、反映状況を確認できます。">
      <div className="space-y-6">
        {!isHistoryView ? (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div
              role="button"
              tabIndex={0}
              onClick={openFileDialog}
              onKeyDown={handleKeyDown}
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[24px] border border-dashed px-8 py-16 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b4dca] ${
                dragActive ? 'border-[#2b4dca] bg-[#eff3ff]' : 'border-slate-300 bg-white'
              }`}
            >
              <p className="text-lg font-semibold text-slate-800">ここにPDFをドラッグ</p>
              <p className="mt-2 text-sm text-slate-500">クリックまたはドラッグで PDF を選択できます。</p>
              <p className="mt-3 text-sm text-slate-400">アップロード後、決定を押すと画面を更新します。</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {pdfFile ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">選択済みのPDF</p>
                <p className="mt-2">{pdfFile.name}</p>
                <p className="mt-1 text-slate-500">サイズ: {(pdfFile.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : null}

            {confirmed ? (
              <div className="mt-6 rounded-[20px] border border-emerald-200 bg-emerald-50 p-6 text-slate-800">
                <p className="text-lg font-semibold text-slate-900">ユーザー画面に時間割を反映しました</p>
                <p className="mt-2 text-sm text-slate-600">
                  選択年度とアップロードしたPDFが反映済みです。
                </p>

                <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm sm:grid-cols-3">
                  <div>
                    <p className="font-semibold">年度</p>
                    <p className="mt-1">{selectedYearLabel}</p>
                  </div>
                  <div>
                    <p className="font-semibold">アップロード済みPDF</p>
                    <p className="mt-1 truncate">{pdfFile?.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">更新日時</p>
                    <p className="mt-1">{updatedAt}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="https://example.com/google-spreadsheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
                  >
                    Googleスプレッドシートを開く
                  </a>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    修正
                  </button>
                </div>

                <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Googleスプレッドシートには、アップロードしたPDFの内容が反映済みです。ユーザー画面には最新の時間割が表示されます。
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">年度選択</span>
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#2b4dca] focus:ring-2 focus:ring-[#2b4dca]/20"
                  >
                    {yearOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!pdfFile || loading}
                  className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? '反映中...' : '決定'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsHistoryView(true)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              過去の年度
            </button>
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#2b4dca]">過去の年度</p>
                <p className="text-sm text-slate-600">過去の登録履歴を確認できます。</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryView(false)}
                className="inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
              >
                現在年度の登録画面へ戻る
              </button>
            </div>

            <div className="space-y-4">
              {historyItems.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600">対象期間: {item.period}</p>
                    <p className="text-sm text-slate-600">更新日: {item.updatedAt}</p>
                  </div>
                  <a
                    href={item.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2b4dca] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c] sm:mt-0"
                  >
                    Googleスプレッドシートを開く
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
