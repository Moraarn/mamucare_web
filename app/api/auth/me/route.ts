import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const text = await backendRes.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    console.log('[auth/me] backend status:', backendRes.status);
    console.log('[auth/me] backend response:', data);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          message: data?.message ?? 'Session expired',
          backendStatus: backendRes.status,
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      user: data?.user ?? data,
    });
  } catch (error) {
    console.error('[auth/me] route failed:', error);

    return NextResponse.json(
      {
        success: false,
        user: null,
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 },
    );
  }
}
