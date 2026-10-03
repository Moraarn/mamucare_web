import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, profile: null, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          profile: null,
          message: data?.message ?? 'Failed to load profile',
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      profile: data?.profile ?? data?.data ?? data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        profile: null,
        message: error instanceof Error ? error.message : 'Failed to load profile',
      },
      { status: 500 },
    );
  }
}
