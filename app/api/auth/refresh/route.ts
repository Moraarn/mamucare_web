import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
  getBackendApiUrl,
} from '@/lib/auth';

function extractAccessToken(data: any): string | null {
  return data?.accessToken ?? data?.access_token ?? data?.token ?? null;
}

function extractRefreshToken(data: any): string | null {
  return data?.refreshToken ?? data?.refresh_token ?? null;
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
  const currentAccessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'Missing refresh token' },
      { status: 401 },
    );
  }

  let userId: string | null = null;

  if (currentAccessToken) {
    try {
      const payload = JSON.parse(
        Buffer.from(currentAccessToken.split('.')[1], 'base64url').toString('utf8'),
      );
      userId = payload?.sub ?? null;
    } catch {
      userId = null;
    }
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'Missing user id for refresh' },
      { status: 401 },
    );
  }

  const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `refresh_token=${refreshToken}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ userId }),
    cache: 'no-store',
  });

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok) {
    return NextResponse.json(
      { success: false, message: data?.message ?? 'Refresh failed' },
      { status: backendRes.status },
    );
  }

  const accessToken = extractAccessToken(data);
  const newRefreshToken = extractRefreshToken(data);

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: 'Refresh succeeded but no access token returned' },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set(AUTH_COOKIE_NAME, accessToken, accessCookieOptions);

  if (newRefreshToken) {
    res.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);
  }

  return res;
}
