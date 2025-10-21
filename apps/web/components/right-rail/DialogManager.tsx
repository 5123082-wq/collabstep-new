'use client';

import { Suspense, lazy } from 'react';
import { useUI } from '@/stores/ui';

const InviteDialog = lazy(() => import('./InviteDialog'));

export function DialogManager() {
  const dialog = useUI((state) => state.dialog);
  return <Suspense fallback={null}>{dialog === 'invite' ? <InviteDialog /> : null}</Suspense>;
}

