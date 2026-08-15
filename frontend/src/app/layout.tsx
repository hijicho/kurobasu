import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@/lib/auth-context';
import { Analytics } from '@vercel/analytics/react';
import '../index.css';

export const metadata: Metadata = {
  title: 'ハム大クロバス',
  description: '非公式のハム大授業評価サイト',
  icons: {
    icon: '/image.png',
    apple: '/image.png',
  },
  openGraph: {
    type: 'website',
    title: 'ハム大クロバス',
    description: '非公式のハム大授業評価サイト',
    images: ['/image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ハム大クロバス',
    description: '非公式のハム大授業評価サイト',
    images: ['/image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BMV4HK8RH2"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BMV4HK8RH2');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
