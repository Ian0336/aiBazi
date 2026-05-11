/** Backend base URL helper — kept dependency-free so it can be imported anywhere. */

export function apiBase(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const url = isProd
    ? process.env.NEXT_PUBLIC_API_BASE_URL_PROD
    : process.env.NEXT_PUBLIC_API_BASE_URL_DEV;
  if (!url) throw new Error('NEXT_PUBLIC_API_BASE_URL not configured');
  return url.replace(/\/$/, '');
}
