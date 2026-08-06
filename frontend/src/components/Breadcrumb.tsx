'use client'

import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          {item.onClick ? (
            <button 
              onClick={item.onClick}
              className="hover:text-theme-primary transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : item.href ? (
            <a href={item.href} className="hover:text-theme-primary transition-colors cursor-pointer">
              {item.label}
            </a>
          ) : (
            <span className="text-theme-primary">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}