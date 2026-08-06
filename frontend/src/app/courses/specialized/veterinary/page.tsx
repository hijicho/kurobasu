'use client';

import { useAuth } from '@/lib/auth-context';
import { VeterinaryNoDataPage } from '@/screens/VeterinaryNoDataPage';

export default function Page() {
  const { isAuthenticated } = useAuth();
  return <VeterinaryNoDataPage isAuthenticated={isAuthenticated} />;
}
