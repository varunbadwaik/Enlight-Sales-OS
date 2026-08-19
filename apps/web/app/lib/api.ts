/**
 * Enlight Sales OS — Dynamic API URL Resolver
 * Automatically resolves endpoint URL for local dev, serverless Vercel, and Cloudflare.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client side: use relative /api/v1 path or window location
    return '/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
}
