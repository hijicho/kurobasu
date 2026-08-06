'use client';

import { useAuth } from '@/lib/auth-context';
import { AgricultureNoDataPage } from '@/screens/AgricultureNoDataPage';

export default function Page() {
  const { isAuthenticated } = useAuth();
  return <AgricultureNoDataPage isAuthenticated={isAuthenticated} />;
}
