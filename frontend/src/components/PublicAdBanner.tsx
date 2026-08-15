'use client';

import { useEffect, useState } from 'react';
import { listAds, type AdImage } from '@/lib/api';

interface PublicAdBannerProps {
  academicYear: number;
  term: string;
}

export function PublicAdBanner({ academicYear, term }: PublicAdBannerProps) {
  const [ads, setAds] = useState<AdImage[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAds() {
      try {
        const response = await listAds(academicYear, term);
        if (!cancelled) {
          setAds(response.items.filter((ad) => ad.is_active));
        }
      } catch (error) {
        console.error('Failed to load ads:', error);
        if (!cancelled) {
          setAds([]);
        }
      }
    }

    loadAds();
    return () => {
      cancelled = true;
    };
  }, [academicYear, term]);

  if (ads.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="広告">
      {ads.map((ad) => (
        <a
          key={ad.ad_id}
          href={ad.image_url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
        >
          <img
            src={ad.image_url}
            alt={ad.original_filename || '広告'}
            className="h-28 md:h-36 w-full object-contain bg-white"
            loading="lazy"
          />
        </a>
      ))}
    </section>
  );
}
