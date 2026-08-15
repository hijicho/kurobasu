import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserRound } from 'lucide-react';
import logoImage from '../assets/e52bb999d689900e37b9d134926cef87854ec798.png';
import { useAuth } from '@/lib/auth-context';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('already')) {
      return 'このメールアドレスは既に登録されています';
  }
  if (lower.includes('invalid email')) {
      return '有効なメールアドレスを入力してください';
  }
  if (lower.includes('password')) {
      return 'パスワードは8文字以上で入力してください';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
      return 'ログイン試行回数が多すぎます。しばらくしてから再度お試しください';
  }
  return 'エラーが発生しました。時間をおいて再度お試しください';
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!loginData.password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    setRegisterSuccessMessage(null);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    setSubmitting(true);
    try {
      await signIn(loginData.email, loginData.password);
      onLoginSuccess?.();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      setErrors({ form: mapAuthError(message) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!registerData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.email);
      if (result.needsEmailConfirmation) {
        setRegisterSuccessMessage('確認メールを送信しました。メール内のリンクを開いてからログインしてください。');
        setActiveTab('login');
        setLoginData({ email: registerData.email, password: '' });
        setRegisterData({ email: '', password: '', confirmPassword: '' });
        return;
      }
      onLoginSuccess?.();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      setErrors({ form: mapAuthError(message) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      await signInAsGuest();
      onLoginSuccess?.();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? '';
      setErrors({ form: mapAuthError(message) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={logoImage.src}
              alt="クロバス" 
              className="h-16 w-auto"
            />
          </div>
          <p className="text-gray-600 mt-2">授業検索・科目まとめシステム</p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* タブ */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                setRegisterSuccessMessage(null);
              }}
              className={`flex-1 py-4 transition-colors ${
                activeTab === 'login'
                  ? 'bg-theme-primary text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                setRegisterSuccessMessage(null);
              }}
              className={`flex-1 py-4 transition-colors ${
                activeTab === 'register'
                  ? 'bg-theme-primary text-white'
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
                {registerSuccessMessage && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                    {registerSuccessMessage}
                  </div>
                )}
                {errors.form && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {errors.form}
                  </div>
                )}
                <div>
                  <label className="block mb-2">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="example@st.omu.ac.jp"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm text-gray-600">パスワードを自動で記憶する</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <a href="/forgot-password" className="text-sm text-gray-600 hover:text-theme-primary">
                    パスワードを忘れた方
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-theme-primary w-full py-3 rounded-xl disabled:opacity-60"
                >
                  {submitting ? 'ログイン中...' : 'ログイン'}
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
                  onClick={handleGuestLogin}
                  disabled={submitting}
                  className="w-full py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <UserRound className="w-5 h-5 text-gray-500" />
                  {submitting ? 'ゲストログイン中...' : 'ゲストとして続ける'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                {errors.form && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {errors.form}
                  </div>
                )}
                <div>
                  <label className="block mb-2">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="example@st.omu.ac.jp"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={`w-full px-4 py-3 pl-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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
                      className={`w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-theme-primary w-full py-3 rounded-xl disabled:opacity-60"
                >
                  {submitting ? '登録中...' : '新規登録'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
