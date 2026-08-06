'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LoginPage } from '@/screens/LoginPage';

export default function Page() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  return (
    <LoginPage
      onLoginSuccess={() => {
        setIsAuthenticated(true);
        router.push('/');
      }}
    />
  );
}
