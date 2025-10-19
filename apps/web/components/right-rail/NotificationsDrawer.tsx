'use client';

import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationsMock } from '@/mocks/notifications';
import { useUI } from '@/stores/ui';

export default function NotificationsDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const setUnreadNotifications = useUI((state) => state.setUnreadNotifications);

  const open = drawer === 'notifications';

  useEffect(() => {
    if (open) {
      setUnreadNotifications(0);
    }
  }, [open, setUnreadNotifications]);

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent side="right" className="flex h-full flex-col bg-neutral-900/95">
        <SheetHeader>
          <SheetTitle>Уведомления</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 space-y-2 pr-2 pt-4">
          <ul className="space-y-3">
            {notificationsMock.map((notification) => (
              <li key={notification.id} className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
                <div className="text-sm text-neutral-100">{notification.title}</div>
                <div className="mt-1 text-xs text-neutral-400">{notification.time}</div>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="border-t border-neutral-800 pt-3">
          <button
            type="button"
            className="w-full rounded-xl border border-transparent bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            onClick={() => setUnreadNotifications(0)}
          >
            Отметить как прочитанные
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
