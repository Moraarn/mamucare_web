import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/auth';

type RouteParams = {
  params: {
    userStatus: string;
  };
};

function normalizeQuestions(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    const value = data as {
      body?: unknown;
      data?: unknown;
      questions?: unknown;
      result?: unknown;
    };

    if (Array.isArray(value.body)) return value.body;
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.questions)) return value.questions;
    if (Array.isArray(value.result)) return value.result;

    if (value.body && typeof value.body === 'object') {
      const body = value.body as {
        data?: unknown;
        questions?: unknown;
      };

      if (Array.isArray(body.data)) return body.data;
      if (Array.isArray(body.questions)) return body.questions;
    }
  }

  return [];
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const url = new URL(req.url);
    const trimester = url.searchParams.get('trimester');

    const backendUrl = new URL(
      `${getBackendApiUrl()}/api/v1/check/questions/${encodeURIComponent(params.userStatus)}`,
    );

    if (trimester) {
      backendUrl.searchParams.set('trimester', trimester);
    }

    const backendRes = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const text = await backendRes.text();

    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    const questions = normalizeQuestions(data);

    return NextResponse.json(
      {
        success: backendRes.ok,
        questions,
        debug: {
          requestedUserStatus: params.userStatus,
          requestedTrimester: trimester,
          backendUrl: backendUrl.toString(),
          backendStatus: backendRes.status,
          raw: data,
        },
      },
      { status: backendRes.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        questions: [],
        message: error instanceof Error ? error.message : 'Failed to load questions',
      },
      { status: 500 },
    );
  }
}
