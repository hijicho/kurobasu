'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, BookMarked, Globe, Calendar, GraduationCap, Languages, ChevronDown, ChevronUp, Activity, Search } from 'lucide-react'
import { Footer } from '@/components/Footer'
import { ExternalLinkButton } from '@/components/ExternalLinkButton'
import { Header } from '@/components/Header'
import { GlossaryModal } from '@/components/GlossaryModal'
import hamubasuLogo from 'figma:asset/59962a0286c10949e8d3fa57e1256b8b69b96d84.png'

export default function TopPageClient() {
  const router = useRouter()
  const [specializedOpen, setSpecializedOpen] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)

  const quickLinks = [
    {
      title: '般教（一般教育科目）',
      description: '幅広い教養を身につける科目',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/courses/general',
      color: 'bg-theme-primary-light',
    },
    {
      title: '第二外国語',
      description: 'ドイツ語・フランス語・中国語など',
      icon: <Globe className="w-5 h-5" />,
      href: '/courses/second-language',
      color: 'bg-purple-50',
    },
    {
      title: '基礎教育科目',
      description: '学びの基盤となる科目',
      icon: <BookMarked className="w-5 h-5" />,
      href: '/courses/foundation',
      color: 'bg-pink-50',
    },
    {
      title: '初年次ゼミナール',
      description: '大学での学び方を習得',
      icon: <GraduationCap className="w-5 h-5" />,
      href: '/courses/first-year-seminar',
      color: 'bg-indigo-50',
    },
    {
      title: '健康・スポーツ科学',
      description: '心身の健康とスポーツ',
      icon: <Activity className="w-5 h-5" />,
      href: '/courses/health-sports',
      color: 'bg-red-50',
    },
    {
      title: '英語',
      description: 'Academic Englishなど',
      icon: <Languages className="w-5 h-5" />,
      href: '/courses/english',
      color: 'bg-teal-50',
    },
  ]

  const specializedCourses = [
    { name: '現代システム科学域', href: '/courses/specialized/modern-system' },
    { name: '理学部', href: '/courses/specialized/science' },
    { name: '工学部', href: '/courses/specialized/engineering' },
    { name: '農学部', href: '/courses/specialized/agriculture' },
    { name: '獣医学部', href: '/courses/specialized/veterinary' },
    { name: '医学部', href: '/courses/specialized/medicine' },
    { name: '看護学部', href: '/courses/specialized/nursing' },
    { name: '生活科学部', href: '/courses/specialized/human-life' },
    { name: '文学部', href: '/courses/specialized/literature' },
    { name: '法学部', href: '/courses/specialized/law' },
    { name: '経済学部', href: '/courses/specialized/economics' },
    { name: '商学部', href: '/courses/specialized/commerce' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <Header isAuthenticated={false} onGlossaryOpen={() => setGlossaryOpen(true)} />
      
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {/* 年度表示 */}
          <div className="text-center mb-6">
            <h1 className="mb-2">2026年度 前期</h1>
            <p className="text-xs text-gray-500 mt-3">
              何かあれば @kurobasu_ocu まで連絡を。落単・情報の誤りには一切責任を負いません。
            </p>
          </div>

          {/* 大学用語リンク */}
          <div className="text-center mb-8">
            <button
              onClick={() => setGlossaryOpen(true)}
              className="text-theme-primary hover:underline inline-flex items-center gap-1"
            >
              大学用語はこちら
            </button>
          </div>

          {/* カテゴリボタン */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-theme-primary transition-all"
              >
                <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center mb-3`}>
                  {link.icon}
                </div>
                <h3 className="text-sm mb-1">{link.title}</h3>
                <p className="text-gray-600 text-xs">{link.description}</p>
              </Link>
            ))}
          </div>

          {/* 専門科目（アコーディオン） */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <button
              onClick={() => setSpecializedOpen(!specializedOpen)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm">専門科目</h3>
                  <p className="text-gray-600 text-xs">各学部の専門分野の科目</p>
                </div>
              </div>
              {specializedOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {specializedOpen && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specializedCourses.map((course, index) => (
                    <Link
                      key={index}
                      href={course.href}
                      className="px-3 py-2 bg-gray-50 rounded-lg hover:bg-theme-primary hover:text-white transition-colors text-center text-sm"
                    >
                      {course.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 時間割の例（下段） */}
          <div className="mb-6">
            <a
              href="/timetable-examples"
              className="block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-theme-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm mb-1">みんなの時間割</h3>
                  <p className="text-gray-600 text-xs">先輩たちの履修パターン</p>
                </div>
              </div>
            </a>
          </div>

          {/* 外部リンク */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ExternalLinkButton
              href="https://hamubasu.com"
              logo={<img src={hamubasuLogo} alt="ハムバス" className="h-full w-auto object-contain" />}
              label="ハムバス"
            />
            <ExternalLinkButton
              href="https://catalog.sp.omu.ac.jp/ja"
              logo={
                <div className="w-8 h-8 bg-theme-primary-light rounded-lg flex items-center justify-center">
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-theme-primary" />
                    <Search className="w-2.5 h-2.5 text-theme-primary absolute -bottom-0.5 -right-0.5" strokeWidth={2.5} />
                  </div>
                </div>
              }
              label="授業カタログ"
            />
          </div>

          {/* 広告枠 */}
          <div className="border border-gray-200 rounded-xl p-8 bg-gray-50 text-center mb-6">
            <p className="text-xs text-gray-400 mb-2">広告</p>
            <p className="text-gray-400 text-sm">広告スペース</p>
          </div>
        </div>
      </main>

      {/* 大学用語モーダル */}
      <GlossaryModal isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />

      <Footer />
    </div>
  )
}
