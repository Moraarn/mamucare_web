import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, getBackendApiUrl } from '@/lib/auth';

type RouteParams = {
  params: {
    sessionId: string;
  };
};

export async function POST(req: Request, { params }: RouteParams) {
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

    const rawAnswerIndex =
      body?.answerIndex ??
      body?.questionIndex ??
      body?.index;

    const answerIndex = Number(rawAnswerIndex);
    const answer = body?.answer;

    if (!Number.isInteger(answerIndex) || answerIndex < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid answerIndex',
          receivedBody: body,
        },
        { status: 400 },
      );
    }

    if (typeof answer !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid answer. Expected boolean.',
          receivedBody: body,
        },
        { status: 400 },
      );
    }

    const backendBody = {
      answerIndex,
      answer,
    };

    const backendUrl = `${getBackendApiUrl()}/api/v1/check/session/${encodeURIComponent(
      params.sessionId,
    )}/answer`;

    const backendRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(backendBody),
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
          message: data?.message ?? 'Failed to save answer',
          backendStatus: backendRes.status,
          backendUrl,
          sentBody: backendBody,
          backendError: data,
        },
        { status: backendRes.status },
      );
    }

    return NextResponse.json({
      success: true,
      session: data?.session ?? data?.data ?? data,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}
