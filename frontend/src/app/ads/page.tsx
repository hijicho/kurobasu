'use client';

import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const acceptableRatio = 1 / 5;
const tolerance = 0.05;

export default function AdsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [ratioValid, setRatioValid] = useState<boolean | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const openFileDialog = () => fileInputRef.current?.click();

  const calculateRatio = (width: number, height: number) => {
    const current = height / width;
    setRatio(current);
    setRatioValid(current >= acceptableRatio * (1 - tolerance) && current <= acceptableRatio * (1 + tolerance));
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('画像ファイルを選択してください。');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setDimensions(null);
    setRatioValid(null);
    setRatio(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const image = new Image();
    image.onload = () => {
      calculateRatio(image.width, image.height);
      setDimensions({ width: image.width, height: image.height });
    };
    image.onerror = () => {
      setErrorMessage('画像の読み込みに失敗しました。別の画像をお試しください。');
      setSelectedFile(null);
      setPreviewUrl(null);
    };
    image.src = url;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDelete = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setPreviewUrl(null);
    setDimensions(null);
    setRatioValid(null);
    setRatio(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  const ratioText = ratio !== null ? ratio.toFixed(2) : '—';

  return (
    <AdminLayout currentPath="/ads" title="広告" subtitle="広告画像のアップロードと比率検証ができます。">
      <div className="space-y-6">
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
            className={`rounded-[24px] border border-dashed px-6 py-14 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2b4dca] ${
              dragActive ? 'border-[#2b4dca] bg-[#eff3ff]' : 'border-slate-300 bg-white'
            }`}
          >
            <p className="text-lg font-semibold text-slate-800">広告画像をここにドラッグ</p>
            <p className="mt-2 text-sm text-slate-500">クリックして画像を選択できます。縦:横 = 1:5 の画像を推奨します。</p>
            <p className="mt-4 text-sm text-slate-400">PNG / JPG などの画像ファイルのみ選択してください。</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {selectedFile ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="広告プレビュー"
                    className="h-64 w-full rounded-[16px] object-contain"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-[16px] border border-slate-200 bg-slate-50 text-sm text-slate-500">
                    プレビューを読み込み中...
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">ファイル情報</p>
                  <p className="mt-2 text-sm text-slate-600">{selectedFile.name}</p>
                  <p className="mt-1 text-sm text-slate-500">サイズ: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>

                {dimensions ? (
                  <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>横幅</span>
                      <span>{dimensions.width}px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>縦幅</span>
                      <span>{dimensions.height}px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>縦:横 の比率</span>
                      <span>{ratioText}</span>
                    </div>
                  </div>
                ) : null}

                {ratioValid === false ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">比率の警告</p>
                    <p className="mt-2">
                      広告画像は縦:横 = 1:5 の画像を推奨しています。現在の比率は {ratioText} です。
                    </p>
                  </div>
                ) : ratioValid === true ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-semibold">比率は適合しています</p>
                    <p className="mt-2">現在の比率は {ratioText} で、推奨の 1:5 に近いです。</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
                  >
                    差し替え
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-slate-200 bg-white p-6 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">広告画像を登録</p>
              <p className="mt-2 text-slate-600">ドラッグ＆ドロップまたはクリックでファイルを選択し、広告画像を登録してください。</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c]"
                >
                  画像を選択
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
