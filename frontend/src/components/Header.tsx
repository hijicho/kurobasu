'use client';

import { useState } from 'react';
import { Menu, X, BookOpen, ExternalLink } from 'lucide-react';
import logoImage from '../assets/e52bb999d689900e37b9d134926cef87854ec798.png';

interface HeaderProps {
  onGlossaryOpen?: () => void;
}

export function Header({ onGlossaryOpen }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* ロゴ */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <img 
              src={logoImage.src}
              alt="クロバス" 
              className="h-10 w-auto"
            />
          </a>

          {/* フォーム入力リンク（デスクトップ） */}
          <a
            href="https://forms.gle/Ash6hm2xLsgiwHGh9"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#2B4DCA] bg-white text-[#2B4DCA] hover:bg-[#2B4DCA] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-sm whitespace-nowrap">フォーム入力もお願いします</span>
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
          </a>

          {/* 右側メニュー */}
          <div className="flex items-center gap-2">
            {/* 大学用語リンク */}
            {onGlossaryOpen && (
              <button
                onClick={onGlossaryOpen}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border border-transparent"
                style={{ 
                  '--hover-bg': 'var(--theme-primary-light)',
                  '--hover-text': 'var(--theme-primary)',
                  '--hover-border': 'var(--theme-primary)'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary-light)';
                  e.currentTarget.style.color = 'var(--theme-primary)';
                  e.currentTarget.style.borderColor = 'var(--theme-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm">大学用語</span>
              </button>
            )}

            {/* モバイルメニュー */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100"
              aria-label="メニュー"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 border-t pt-4">
            {/* フォーム入力リンク（モバイル） */}
            <a
              href="https://forms.gle/Ash6hm2xLsgiwHGh9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-[#2B4DCA] bg-white text-[#2B4DCA] hover:bg-[#2B4DCA] hover:text-white transition-all duration-200"
            >
              <span className="text-sm">フォーム入力もお願いします</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>

            {/* モバイルメニューリンク */}
            {onGlossaryOpen && (
              <button
                onClick={onGlossaryOpen}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100"
              >
                <BookOpen className="w-5 h-5" />
                <span>大学用語</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
