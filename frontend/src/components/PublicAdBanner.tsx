'use client';

import { useEffect, useState } from 'react';
import { API_ORIGIN, getDefaultAcademicYear, listAds, type AdImage } from '../lib/api';

interface PublicAdBannerProps {
  term?: string;
}

const getImageSrc = (imageUrl: string) => {
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  return `${API_ORIGIN}${imageUrl}`;
};

export function PublicAdBanner({ term = 'spring' }: PublicAdBannerProps) {
  const [ad, setAd] = useState<AdImage | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAd() {
      try {
        const { academic_year } = await getDefaultAcademicYear();
        const response = await listAds(academic_year, term);
        if (!cancelled) {
          setAd(response.items.find((item) => item.is_active) ?? null);
        }
      } catch (error) {
        console.error('Failed to load ads:', error);
        if (!cancelled) {
          setAd(null);
        }
      }
    }

    loadAd();
    return () => {
      cancelled = true;
    };
  }, [term]);

  // 縦横比 1:5（縦:横）の広告枠。未掲載時は枠だけ表示して空きであることを示す。
  return (
    <section aria-label="広告">
      {ad ? (
        <a
          href={getImageSrc(ad.image_url)}
          target="_blank"
          rel="noreferrer"
          className="block w-full overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          style={{ aspectRatio: '5 / 1' }}
        >
          <img
            src={getImageSrc(ad.image_url)}
            alt={ad.original_filename || '広告'}
            className="h-full w-full object-contain bg-white"
            loading="lazy"
          />
        </a>
      ) : (
        <div
          className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400"
          style={{ aspectRatio: '5 / 1' }}
        >
          広告枠（現在未掲載です）
        </div>
      )}
    </section>
  );
}
