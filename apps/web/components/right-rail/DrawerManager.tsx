'use client';

import { Suspense, lazy } from 'react';
import { useUI } from '@/stores/ui';

const ChatDrawer = lazy(() => import('./ChatDrawer'));
const NotificationsDrawer = lazy(() => import('./NotificationsDrawer'));

export function DrawerManager() {
  const drawer = useUI((state) => state.drawer);

  return (
    <Suspense fallback={null}>
      {drawer === 'chats' ? <ChatDrawer /> : null}
      {drawer === 'notifications' ? <NotificationsDrawer /> : null}
    </Suspense>
  );
}
