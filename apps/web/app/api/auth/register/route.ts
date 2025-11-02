import { NextRequest, NextResponse } from 'next/server';
import { encodeDemoSession } from '@/lib/auth/demo-session';
import { withSessionCookie } from '@/lib/auth/session-cookie';
import { usersRepository } from '@collabverse/api';

const INVALID_MESSAGE = 'Заполните все поля корректно';

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validatePassword(value: string): boolean {
  return value.length >= 6;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }

  const name = sanitizeString(payload.name);
  const email = sanitizeString(payload.email);
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!name || !email || !isValidEmail(email) || !validatePassword(password)) {
    return NextResponse.json({ error: INVALID_MESSAGE }, { status: 400 });
  }

  // Проверяем, существует ли пользователь
  const existingUser = usersRepository.findById(email);
  if (existingUser) {
    // Если пользователь существует, просто создаём сессию
    const sessionToken = encodeDemoSession({ email: existingUser.email, role: 'user', issuedAt: Date.now() });
    const response = NextResponse.json({ redirect: '/app/dashboard' });
    return withSessionCookie(response, sessionToken);
  }

  // Создаём нового пользователя
  const newUser = usersRepository.create({
    name,
    email: email.toLowerCase(),
    title: undefined,
    avatarUrl: undefined,
    department: undefined,
    location: undefined
  });

  // Создаём сессию
  const sessionToken = encodeDemoSession({ email: newUser.email, role: 'user', issuedAt: Date.now() });
  const response = NextResponse.json({ redirect: '/app/dashboard' });

  return withSessionCookie(response, sessionToken);
}
