'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import AppTopbar from '@/components/app/AppTopbar';
import CommandPalette from '@/components/app/CommandPalette';
import ContentContainer from '@/components/app/ContentContainer';
import CreateMenu from '@/components/app/CreateMenu';
import RightActionsPanel from '@/components/app/RightActionsPanel';
import Sidebar from '@/components/app/Sidebar';
import ToastHub from '@/components/app/ToastHub';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-transparent text-neutral-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppTopbar onOpenCreate={() => setCreateOpen(true)} onOpenPalette={() => setPaletteOpen(true)} />
        <div className="flex flex-1 overflow-hidden bg-neutral-950/70">
          <ContentContainer>{children}</ContentContainer>
          <RightActionsPanel />
        </div>
      </div>
      <CreateMenu open={isCreateOpen} onClose={() => setCreateOpen(false)} />
      <CommandPalette open={isPaletteOpen} onClose={() => setPaletteOpen(false)} />
      <ToastHub />
    </div>
  );
}
