'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPageClient() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!loginData.email) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }
    
    if (!loginData.password) {
      newErrors.password = 'パスワードを入力してください'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      console.log('ログイン:', loginData)
      // ログイン処理成功後、マイページへ遷移
      router.push('/mypage')
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    
    if (!registerData.email) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }
    
    if (!registerData.password) {
      newErrors.password = 'パスワードを入力してください'
    } else if (registerData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください'
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }
    
    if (!registerData.agreeToTerms) {
      newErrors.terms = '利用規約とプライバシーポリシーに同意してください'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      console.log('新規登録:', registerData)
      // 登録処理成功後、マイページへ遷移
      router.push('/mypage')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-theme-primary rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">ク</span>
            </div>
          </div>
          <h1 className="mt-2">クロバス</h1>
          <p className="text-gray-600 mt-2">授業検索・科目まとめシステム</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* タブ */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login')
                setErrors({})
              }}
              className={`flex-1 py-4 transition-colors ${
                activeTab === 'login'
                  ? 'btn-theme-primary'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => {
                setActiveTab('register')
                setErrors({})
              }}
              className={`flex-1 py-4 transition-colors ${
                activeTab === 'register'
                  ? 'btn-theme-primary'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              新規登録
            </button>
          </div>

          {/* フォーム */}
          <div className="p-6 md:p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block mb-2">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="example@university.ac.jp"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block mb-2">パスワード</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#2B4DCA] focus:ring-[#2B4DCA]"
                    />
                    <span className="text-sm text-gray-600">パスワードを自動で記憶する</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-theme-primary">
                    パスワードを忘れた方
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 btn-theme-primary rounded-xl"
                >
                  ログイン
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">または</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Googleでログイン
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block mb-2">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="example@university.ac.jp"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block mb-2">パスワード</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8文字以上"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block mb-2">パスワード（確認用）</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="パスワードを再入力"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4DCA] ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={registerData.agreeToTerms}
                      onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#2B4DCA] focus:ring-[#2B4DCA]"
                    />
                    <span className="text-sm text-gray-600">
                      <Link href="/terms" className="text-theme-primary hover:underline">利用規約</Link>
                      と
                      <Link href="/privacy" className="text-theme-primary hover:underline">プライバシーポリシー</Link>
                      に同意します
                    </span>
                  </label>
                  {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 btn-theme-primary rounded-xl"
                >
                  新規登録
                </button>
              </form>
            )}
          </div>
        </div>

        {/* フッターリンク */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/terms" className="hover:text-theme-primary">利用規約</Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-theme-primary">プライバシーポリシー</Link>
        </div>
      </div>
    </div>
  )
}
