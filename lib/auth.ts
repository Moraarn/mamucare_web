import type { User } from '@/store/useStore'

export const AUTH_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export const authCookieOptions = accessCookieOptions;

export function getBackendApiUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error('BACKEND_API_URL is not configured');
  }
  return url.replace(/\/$/, '');
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);

    return data?.user ?? data ?? null;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

// Server-side token retrieval (use this in server actions/components)
export async function getServerToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null
  } catch {
    return null
  }
}