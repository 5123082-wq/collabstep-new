import { cookies } from 'next/headers';

import { decodeDemoSession, DEMO_SESSION_COOKIE } from '@/lib/auth/demo-session';

export function getDemoSessionFromCookies() {
  const store = cookies();
  const cookie = store.get(DEMO_SESSION_COOKIE);

  return decodeDemoSession(cookie?.value ?? null);
}
