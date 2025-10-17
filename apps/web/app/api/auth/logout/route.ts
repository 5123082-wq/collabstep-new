import { NextRequest, NextResponse } from 'next/server';
import { withoutSessionCookie } from '@/lib/auth/session-cookie';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const redirectUrl = new URL('/login', request.url);
  const acceptsJson = (request.headers.get('accept') ?? '').includes('application/json');

  if (acceptsJson) {
    const response = NextResponse.json({ redirect: redirectUrl.pathname });
    return withoutSessionCookie(response);
  }

  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  return withoutSessionCookie(response);
}
