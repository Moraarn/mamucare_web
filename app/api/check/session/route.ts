import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

function normalizeSession(data: any) {
  return data?.session ?? data?.body ?? data?.data ?? data;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, session: null, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${getBackendApiUrl()}/api/v1/check/session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await backendRes.json().catch(() => null);
    const session = normalizeSession(data);

    return NextResponse.json(
      {
        success: backendRes.ok,
        session,
        sessionId: session?.id ?? session?._id ?? data?.sessionId ?? null,
        backendError: backendRes.ok ? undefined : data,
      },
      { status: backendRes.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        session: null,
        sessionId: null,
        message: error instanceof Error ? error.message : 'Failed to create session',
      },
      { status: 500 },
    );
  }
}
