'use client'

import { useState, useEffect } from 'react';
import { Search, Menu, X, BookOpen, User, LogOut } from 'lucide-react';
import logoImage from 'figma:asset/e52bb999d689900e37b9d134926cef87854ec798.png';

interface HeaderProps {
  onSearch?: (query: string) => void;
  isAuthenticated?: boolean;
  onGlossaryOpen?: () => void;
}

export function Header({ onSearch, isAuthenticated = true, onGlossaryOpen }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* ロゴ */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <img 
              src={logoImage} 
              alt="クロバス" 
              className="h-10 w-auto"
            />
          </a>

          {/* デスクトップ検索 */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="授業名・教員名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* 右側メニュー */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <a
                href="/mypage"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>マイページ</span>
              </a>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ログイン
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 text-white rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary)'}
                >
                  新規登録
                </a>
              </div>
            )}

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

        {/* モバイル検索とメニュー */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 border-t pt-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="授業名・教員名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </form>
            
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

            {isAuthenticated ? (
              <a
                href="/mypage"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100"
              >
                <User className="w-5 h-5" />
                <span>マイページ</span>
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ログイン
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 text-white rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-primary)'}
                >
                  新規登録
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}