'use client';

import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatsMock } from '@/mocks/chats';
import { useUI } from '@/stores/ui';

export default function ChatDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const setUnreadChats = useUI((state) => state.setUnreadChats);

  const open = drawer === 'chats';

  useEffect(() => {
    if (open) {
      setUnreadChats(0);
    }
  }, [open, setUnreadChats]);

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent side="right" className="flex h-full flex-col bg-neutral-900/95">
        <SheetHeader>
          <SheetTitle>Чаты</SheetTitle>
        </SheetHeader>
        <div className="py-3">
          <Input placeholder="Поиск по чатам" aria-label="Поиск по чатам" />
        </div>
        <ScrollArea className="flex-1 pr-2">
          <ul className="space-y-2">
            {chatsMock.map((chat) => (
              <li key={chat.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-transparent bg-neutral-900/70 p-3 text-left transition hover:border-indigo-500/50 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  onClick={() => {
                    setUnreadChats(0);
                    closeDrawer();
                  }}
                >
                  <div className="text-sm font-medium text-neutral-100">{chat.title}</div>
                  <div className="mt-1 text-xs text-neutral-400">{chat.lastMessage}</div>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
