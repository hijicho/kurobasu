'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LogoutPage() {
  const router = useRouter();
  const { signOutUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await signOutUser();
    } finally {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[24px] border border-slate-200 bg-[#f8f9fa] p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-800">
          ログアウトします。
          <br />
          本当によろしいですか？
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="rounded-full bg-[#2b4dca] px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'ログアウト中...' : 'ログアウト'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
