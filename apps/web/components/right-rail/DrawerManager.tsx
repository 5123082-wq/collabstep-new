'use client';

import { Suspense, lazy } from 'react';
import { useUI } from '@/stores/ui';

const CommunicationDrawer = lazy(() => import('./CommunicationDrawer'));

export function DrawerManager() {
  const drawer = useUI((state) => state.drawer);
  const isCommunicationDrawer = drawer === 'chats' || drawer === 'notifications';

  return (
    <Suspense fallback={null}>
      {isCommunicationDrawer ? <CommunicationDrawer /> : null}
    </Suspense>
  );
}
