'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { API_ORIGIN, deleteAdminAd, getDefaultAcademicYear, listAdminAds, uploadAdminAd, type AdImage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const acceptableRatio = 1 / 5;
const tolerance = 0.05;

const adTerms = [
  { key: 'spring', label: '前期' },
  { key: 'fall', label: '後期' },
  { key: 'intensive', label: '集中' },
  { key: 'year', label: '通年' },
];

const getImageSrc = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${API_ORIGIN}${imageUrl}`;
};

export default function AdsPage() {
  const { getIdToken } = useAuth();
  const [ads, setAds] = useState<AdImage[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<number>(new Date().getFullYear());
  const [selectedTerm, setSelectedTerm] = useState(adTerms[0].key);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [ratioValid, setRatioValid] = useState<boolean | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAdId, setDeletingAdId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeAds = useMemo(() => ads.filter((ad) => ad.is_active), [ads]);
  const currentAd = activeAds.find((ad) => ad.academic_year === selectedAcademicYear && ad.term === selectedTerm);

  const loadAds = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('not authenticated');
      }
      const response = await listAdminAds(idToken);
      setAds(response.items);
    } catch {
      setErrorMessage('広告一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  useEffect(() => {
    getDefaultAcademicYear()
      .then((res) => setSelectedAcademicYear(res.academic_year))
      .catch(() => undefined);
  }, []);

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
    setSuccessMessage(null);
    setSelectedFile(file);
    setDimensions(null);
    setRatioValid(null);
    setRatio(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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

  const resetSelection = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setPreviewUrl(null);
    setDimensions(null);
    setRatioValid(null);
    setRatio(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('画像を選択してください。');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('not authenticated');
      }
      await uploadAdminAd(idToken, selectedAcademicYear, selectedTerm, selectedFile);
      setSuccessMessage('広告画像を保存しました。');
      resetSelection();
      await loadAds();
    } catch {
      setErrorMessage('広告画像の保存に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adId: number) => {
    setDeletingAdId(adId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('not authenticated');
      }
      await deleteAdminAd(idToken, adId);
      setSuccessMessage('広告画像を削除しました。');
      await loadAds();
    } catch {
      setErrorMessage('広告画像の削除に失敗しました。');
    } finally {
      setDeletingAdId(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  const ratioText = ratio !== null ? ratio.toFixed(2) : '-';

  return (
    <AdminLayout currentPath="/ads" title="広告" subtitle="広告画像を学期ごとにアップロードできます。">
      <div className="space-y-6">
        <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
          <div className="mb-5 grid gap-4 md:grid-cols-[160px_220px_1fr]">
            <label className="block text-sm font-semibold text-slate-700">
              年度
              <input
                type="number"
                min={2000}
                max={2100}
                value={selectedAcademicYear}
                onChange={(event) => setSelectedAcademicYear(Number(event.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2b4dca] focus:outline-none"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              学期
              <select
                value={selectedTerm}
                onChange={(event) => setSelectedTerm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-[#2b4dca] focus:outline-none"
              >
                {adTerms.map((term) => (
                  <option key={term.key} value={term.key}>
                    {term.label}
                  </option>
                ))}
              </select>
            </label>

            {currentAd ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">選択中の学期の最新広告</p>
                <p className="mt-1 text-slate-500">{currentAd.original_filename}</p>
                <img src={getImageSrc(currentAd.image_url)} alt="現在の広告" className="mt-3 h-24 w-full rounded-xl object-contain" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                この学期にはまだ画像が設定されていません。
              </div>
            )}
          </div>

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
            <p className="mt-4 text-sm text-slate-400">PNG / JPG / WebP / GIF、5MB まで。</p>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {selectedFile ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                {previewUrl ? (
                  <img src={previewUrl} alt="広告プレビュー" className="h-64 w-full rounded-[16px] object-contain" />
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
                    <p className="mt-2">推奨比率は 1:5 です。現在の比率は {ratioText} です。</p>
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
                    onClick={handleUpload}
                    disabled={submitting}
                    className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#243f9c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? '保存中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    画像を変更
                  </button>
                  <button
                    type="button"
                    onClick={resetSelection}
                    className="rounded-full border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">設定済み広告</p>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">読み込み中...</p>
          ) : activeAds.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">設定済みの広告はありません。</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {activeAds.map((ad) => {
                const label = adTerms.find((term) => term.key === ad.term)?.label ?? ad.term;
                return (
                  <div key={ad.ad_id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {ad.academic_year}年度 {label}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{ad.original_filename}</p>
                      </div>
                      <button
                        type="button"
                        disabled={deletingAdId === ad.ad_id}
                        onClick={() => handleDelete(ad.ad_id)}
                        className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        削除
                      </button>
                    </div>
                    <img src={getImageSrc(ad.image_url)} alt={`${ad.academic_year}年度 ${label} 広告`} className="mt-4 h-28 w-full rounded-xl object-contain" />
                    <p className="mt-3 text-xs text-slate-400">
                      更新: {new Date(ad.updated_at).toLocaleString('ja-JP', { hour12: false })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
