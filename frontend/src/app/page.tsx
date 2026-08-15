import { redirect } from 'next/navigation';
import { DEFAULT_PUBLIC_TERM, DEFAULT_PUBLIC_YEAR, publicTopPath } from '@/lib/public-routing';

export const dynamic = 'force-dynamic';

type SiteSettingsPayload = {
  data?: {
    default_academic_year?: number;
    default_term?: string;
  };
};

async function getDefaultPublicPath() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    return publicTopPath(DEFAULT_PUBLIC_YEAR, DEFAULT_PUBLIC_TERM);
  }

  try {
    const response = await fetch(`${apiBaseUrl}/meta/site-settings`, { cache: 'no-store' });
    if (!response.ok) {
      return publicTopPath(DEFAULT_PUBLIC_YEAR, DEFAULT_PUBLIC_TERM);
    }
    const payload = (await response.json()) as SiteSettingsPayload;
    const year = payload.data?.default_academic_year ?? DEFAULT_PUBLIC_YEAR;
    const term = payload.data?.default_term ?? DEFAULT_PUBLIC_TERM;
    return publicTopPath(year, term);
  } catch {
    return publicTopPath(DEFAULT_PUBLIC_YEAR, DEFAULT_PUBLIC_TERM);
  }
}

export default async function Page() {
  redirect(await getDefaultPublicPath());
}
