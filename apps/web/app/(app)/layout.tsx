import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppLayoutClient from '@/components/app/AppLayoutClient';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

export default function AppLayout({ children }: { children: ReactNode }) {
  const session = getDemoSessionFromCookies();

  if (!session) {
    redirect('/login?toast=auth-required');
  }

  return <AppLayoutClient session={session}>{children}</AppLayoutClient>;
}
