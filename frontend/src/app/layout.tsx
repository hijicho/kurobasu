import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import '../styles/globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'クロバス - 授業検索・科目まとめ',
  description: '学生向けの授業検索・科目まとめWebアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className={notoSansJP.className}>
        {children}
      </body>
    </html>
  )
}
