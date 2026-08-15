import { redirect } from 'next/navigation';
import { DEFAULT_PUBLIC_TERM, DEFAULT_PUBLIC_YEAR, publicTopPath } from '@/lib/public-routing';

export default function Page() {
  redirect(publicTopPath(DEFAULT_PUBLIC_YEAR, DEFAULT_PUBLIC_TERM));
}
