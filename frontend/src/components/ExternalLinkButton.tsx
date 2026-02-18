'use client'

import { ExternalLink } from 'lucide-react';
import { ReactNode } from 'react';

interface ExternalLinkButtonProps {
  href: string;
  logo: ReactNode;
  label?: string; // ラベルをオプショナルに
  className?: string;
  logoOnly?: boolean; // ロゴのみモードを追加
}

export function ExternalLinkButton({ href, logo, label, className = '', logoOnly = false }: ExternalLinkButtonProps) {
  if (logoOnly) {
    // ロゴのみの場合：「時間割の例」と同じ高さに調整
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-theme-primary transition-all h-[58px] ${className}`}
      >
        <div className="h-full max-h-[40px] flex items-center">
          {logo}
        </div>
      </a>
    );
  }

  // ロゴ+テキストの場合：「時間割の例」と同じ高さに調整
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-theme-primary transition-all h-[58px] ${className}`}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {logo}
      </div>
      {label && <span className="flex-1 text-left text-sm">{label}</span>}
      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </a>
  );
}