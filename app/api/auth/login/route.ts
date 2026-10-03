import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  accessCookieOptions,
  refreshCookieOptions,
  getBackendApiUrl,
} from '@/lib/auth';

function extractAccessToken(data: any): string | null {
  return (
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    data?.body?.accessToken ??
    data?.body?.access_token ??
    data?.data?.accessToken ??
    data?.data?.access_token ??
    null
  );
}

function extractRefreshToken(data: any): string | null {
  return (
    data?.refreshToken ??
    data?.refresh_token ??
    data?.body?.refreshToken ??
    data?.body?.refresh_token ??
    data?.data?.refreshToken ??
    data?.data?.refresh_token ??
    null
  );
}

function extractUser(data: any): unknown {
  return data?.user ?? data?.body?.user ?? data?.data?.user ?? null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = `${getBackendApiUrl()}/api/v1/auth/login`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await backendRes.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    console.log('[auth/login] backend status:', backendRes.status);
    console.log('[auth/login] backend response:', data);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message ?? 'Login failed',
          backendStatus: backendRes.status,
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    const accessToken = extractAccessToken(data);
    const refreshToken = extractRefreshToken(data);
    const user = extractUser(data);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Auth succeeded but backend did not return an access token.',
          backendResponse: data,
        },
        { status: 502 },
      );
    }

    const res = NextResponse.json({
      success: true,
      user,
    });

    res.cookies.set(AUTH_COOKIE_NAME, accessToken, accessCookieOptions);

    if (refreshToken) {
      res.cookies.set(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    }

    return res;
  } catch (error) {
    console.error('[auth/login] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 },
    );
  }
}
