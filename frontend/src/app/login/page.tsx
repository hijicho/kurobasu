'use client';

import { useRouter } from 'next/navigation';
import { LoginPage } from '@/screens/LoginPage';

export default function Page() {
  const router = useRouter();
  return (
    <LoginPage
      onLoginSuccess={() => {
        router.push('/');
      }}
    />
  );
}
