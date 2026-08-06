'use client';

import { useAuth } from '@/lib/auth-context';
import { MedicalNoDataPage } from '@/screens/MedicalNoDataPage';

export default function Page() {
  const { isAuthenticated } = useAuth();
  return <MedicalNoDataPage isAuthenticated={isAuthenticated} />;
}
