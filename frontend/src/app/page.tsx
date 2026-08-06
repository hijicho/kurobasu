'use client';

import { useAuth } from '@/lib/auth-context';
import { TopPage } from '@/screens/TopPage';

export default function Page() {
  const { isAuthenticated } = useAuth();
  return <TopPage isAuthenticated={isAuthenticated} />;
}
