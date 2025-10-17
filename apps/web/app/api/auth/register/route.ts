import { NextRequest, NextResponse } from 'next/server';
import { encodeDemoSession, isDemoAuthEnabled } from '@/lib/auth/demo-session';
import { withSessionCookie } from '@/lib/auth/session-cookie';

const INVALID_MESSAGE = 'Заполните все поля корректно';

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validatePassword(value: string): boolean {
  return value.length >= 6;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isDemoAuthEnabled()) {
    return NextResponse.json({ error: 'Dev registration disabled' }, { status: 403 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }

  const name = sanitizeString(payload.name);
  const email = sanitizeString(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!name || !email || !validatePassword(password)) {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }

  const sessionToken = encodeDemoSession({ email, role: 'user', issuedAt: Date.now() });
  const response = NextResponse.json({ redirect: '/app/dashboard' });

  return withSessionCookie(response, sessionToken);
}
