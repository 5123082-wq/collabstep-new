import { NextRequest, NextResponse } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_MAX_AGE,
  encodeDemoSession,
  getDemoAccount,
  isDemoAuthEnabled,
  parseDemoRole,
  type DemoRole
} from '@/lib/auth/demo-session';

type DemoLoginResponse = NextResponse<unknown>;

function disabledResponse(request: NextRequest): DemoLoginResponse {
  return NextResponse.json(
    { error: 'Demo authentication is disabled.' },
    { status: 403, headers: { 'Cache-Control': 'no-store', 'X-Demo-Auth': 'disabled', 'X-Request-Path': request.nextUrl.pathname } }
  );
}

async function extractRole(request: NextRequest): Promise<DemoRole | null> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const payload = await request.json();
      return parseDemoRole((payload as Record<string, unknown>)?.role);
    } catch (error) {
      return null;
    }
  }

  try {
    const formData = await request.formData();
    return parseDemoRole(formData.get('role'));
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<DemoLoginResponse> {
  if (!isDemoAuthEnabled()) {
    return disabledResponse(request);
  }

  const role = await extractRole(request);

  if (!role) {
    return NextResponse.json({ error: 'Invalid role supplied.' }, { status: 400 });
  }

  const account = getDemoAccount(role);

  const sessionToken = encodeDemoSession({ email: account.email, role, issuedAt: Date.now() });
  const response = NextResponse.redirect(new URL('/app/dashboard', request.url), { status: 303 });

  response.cookies.set({
    name: DEMO_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    maxAge: DEMO_SESSION_MAX_AGE,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production'
  });

  response.headers.set('Cache-Control', 'no-store');

  return response;
}
