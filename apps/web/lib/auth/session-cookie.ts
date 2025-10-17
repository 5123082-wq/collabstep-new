import { NextResponse } from 'next/server';
import { DEMO_SESSION_COOKIE, DEMO_SESSION_MAX_AGE } from '@/lib/auth/demo-session';

const isSecure = process.env.NODE_ENV === 'production';

type AnyResponse<T = unknown> = NextResponse<T>;

export function withSessionCookie<T>(response: AnyResponse<T>, token: string): AnyResponse<T> {
  response.cookies.set({
    name: DEMO_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    maxAge: DEMO_SESSION_MAX_AGE,
    sameSite: 'lax',
    path: '/',
    secure: isSecure
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export function withoutSessionCookie<T>(response: AnyResponse<T>): AnyResponse<T> {
  response.cookies.set({
    name: DEMO_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    maxAge: 0,
    sameSite: 'lax',
    path: '/',
    secure: isSecure
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
