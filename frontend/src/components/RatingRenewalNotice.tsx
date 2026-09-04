'use client';

import { Sparkles } from 'lucide-react';
import { isRatingRenewalNoticeActive } from '../lib/rating-renewal';

interface RatingRenewalNoticeProps {
  className?: string;
}

export function RatingRenewalNotice({ className = '' }: RatingRenewalNoticeProps) {
  if (!isRatingRenewalNoticeActive()) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-[#2B4DCA]/30 bg-[#2B4DCA]/5 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium text-[#2B4DCA] ${className}`}
    >
      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
      <span>リニューアルしました！皆様の評価により評価が決まります</span>
    </div>
  );
}
