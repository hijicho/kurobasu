'use client';

type AdminLoadingBlockProps = {
  rows?: number;
  className?: string;
};

export default function AdminLoadingBlock({ rows = 2, className = '' }: AdminLoadingBlockProps) {
  return (
    <div className={`rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-5 shadow-sm ${className}`}>
      <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`h-4 animate-pulse rounded-full bg-slate-100 ${index % 2 === 0 ? 'w-full' : 'w-2/3'}`}
          />
        ))}
      </div>
    </div>
  );
}
