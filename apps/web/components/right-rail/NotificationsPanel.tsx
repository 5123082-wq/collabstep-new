'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationsMock } from '@/mocks/notifications';

type NotificationsPanelProps = {
  onMarkAllRead: () => void;
};

export default function NotificationsPanel({ onMarkAllRead }: NotificationsPanelProps) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1 px-6 pb-6 pr-4 pt-6">
        <ul className="space-y-3">
          {notificationsMock.map((notification) => (
            <li key={notification.id} className="rounded-xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] p-4">
              <div className="text-sm text-[color:var(--text-primary)]">{notification.title}</div>
              <div className="mt-1 text-xs text-[color:var(--text-tertiary)]">{notification.time}</div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <div className="border-t border-[color:var(--surface-border-subtle)] px-6 pb-6 pt-4">
        <button
          type="button"
          className="w-full rounded-xl border border-transparent bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          onClick={onMarkAllRead}
        >
          Отметить как прочитанные
        </button>
      </div>
    </div>
  );
}
