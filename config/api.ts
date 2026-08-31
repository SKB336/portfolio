/**
 * Centralized API Configuration
 * 
 * Change your API domain in ONE place:
 * 1. Environment variable: set NEXT_PUBLIC_API_BASE_URL in your .env.local file.
 *    e.g. NEXT_PUBLIC_API_BASE_URL=http://192.168.18.197:10000
 *    e.g. NEXT_PUBLIC_API_BASE_URL=https://your-tailscale-name.ts.net
 * 2. Default fallback below: change the URL string if no env var is set.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://odoo-211082-crm-0.taila4452f.ts.net'
).replace(/\/$/, '');

/**
 * Helper function to construct full API URLs
 * @param endpoint - e.g. '/calculate' or 'calculate'
 * @returns full URL string, e.g. 'https://api.crackvault.work/calculate'
 */
export function getApiUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}
