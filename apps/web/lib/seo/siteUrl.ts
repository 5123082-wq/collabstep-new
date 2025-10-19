const FALLBACK_SITE_URL = 'https://collabverse.local';

export function getSiteUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
  return base.replace(/\/$/, '');
}
