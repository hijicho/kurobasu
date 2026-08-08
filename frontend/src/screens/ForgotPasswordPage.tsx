'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import logoImage from '../assets/e52bb999d689900e37b9d134926cef87854ec798.png';
import { useAuth } from '@/lib/auth-context';

function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return '有効なメールアドレスを入力してください';
    case 'auth/too-many-requests':
      return 'リクエストが多すぎます。しばらくしてから再度お試しください';
    default:
      return 'エラーが発生しました。時間をおいて再度お試しください';
  }
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      // メール送信の成否でアカウントの有無が推測できないよう、user-not-found も成功扱いにする
      if (code === 'auth/user-not-found') {
        setSent(true);
      } else {
        setError(mapFirebaseAuthError(code));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logoImage.src} alt="クロバス" className="h-16 w-auto" />
          </div>
          <p className="text-gray-600 mt-2">パスワードの再設定</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-6 md:p-8">
          {sent ? (
            <div className="space-y-5 text-center">
              <p className="text-gray-700">
                パスワード再設定用のメールを送信しました。
                <br />
                受信トレイをご確認ください。
              </p>
              <a href="/login" className="inline-block text-sm text-theme-primary hover:underline">
                ログイン画面に戻る
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600">
                登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
              </p>

              <div>
                <label className="block mb-2">メールアドレス</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="example@st.omu.ac.jp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 pl-11 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      error ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-theme-primary w-full py-3 rounded-xl disabled:opacity-60"
              >
                {submitting ? '送信中...' : '再設定メールを送信'}
              </button>

              <div className="text-center">
                <a href="/login" className="text-sm text-gray-600 hover:text-theme-primary">
                  ログイン画面に戻る
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
