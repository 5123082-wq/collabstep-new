'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatsMock } from '@/mocks/chats';

type ChatPanelProps = {
  onSelectChat: () => void;
};

export default function ChatPanel({ onSelectChat }: ChatPanelProps) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="px-6 pb-4 pt-3">
        <Input placeholder="Поиск по чатам" aria-label="Поиск по чатам" />
      </div>
      <ScrollArea className="flex-1 px-6 pb-6 pr-4">
        <ul className="space-y-2">
          {chatsMock.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className="w-full rounded-xl border border-transparent bg-neutral-900/70 p-3 text-left transition hover:border-indigo-500/50 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                onClick={onSelectChat}
              >
                <div className="text-sm font-medium text-neutral-100">{chat.title}</div>
                <div className="mt-1 text-xs text-neutral-400">{chat.lastMessage}</div>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
