import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

type RouteParams = {
  params: {
    sessionId: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    const backendUrl = `${getBackendApiUrl()}/api/v1/check/session/${encodeURIComponent(
      params.sessionId,
    )}/complete`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
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

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: backendRes.status === 409
            ? 'Checkup completion is already in progress. Please try again shortly.'
            : 'Failed to complete session',
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      result: data?.data ?? data?.result ?? data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to complete session',
      },
      { status: 500 },
    );
  }
}
