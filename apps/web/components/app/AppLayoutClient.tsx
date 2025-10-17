'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppTopbar from '@/components/app/AppTopbar';
import CommandPalette from '@/components/app/CommandPalette';
import ContentContainer from '@/components/app/ContentContainer';
import CreateMenu from '@/components/app/CreateMenu';
import RightActionsPanel from '@/components/app/RightActionsPanel';
import Sidebar from '@/components/app/Sidebar';
import ToastHub from '@/components/app/ToastHub';
import type { DemoSession } from '@/lib/auth/demo-session';
import { getRolesForDemoRole, setUserRoles } from '@/lib/auth/roles';
import { toast } from '@/lib/ui/toast';
import { useQueryToast } from '@/lib/ui/useQueryToast';

const TOAST_MESSAGES: Record<string, { message: string; tone?: 'info' | 'success' | 'warning' }> = {
  'register-success': { message: 'Регистрация успешна', tone: 'success' },
  forbidden: { message: 'Недостаточно прав', tone: 'warning' }
};

type AppLayoutClientProps = {
  session: DemoSession;
  children: ReactNode;
};

export default function AppLayoutClient({ session, children }: AppLayoutClientProps) {
  const router = useRouter();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const [isLoggingOut, setLoggingOut] = useState(false);
  const roles = useMemo(() => getRolesForDemoRole(session.role), [session.role]);
  useQueryToast(TOAST_MESSAGES);

  useEffect(() => {
    setUserRoles(roles);
  }, [roles]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        setCreateOpen(false);
        setPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        }
      });

      if (response.ok) {
        const data = (await response.json().catch(() => null)) as { redirect?: string } | null;
        if (data?.redirect) {
          router.push(data.redirect);
          return;
        }
      }

      if (response.redirected) {
        router.push(response.url);
        return;
      }

      router.push('/login');
    } catch (error) {
      toast('Не удалось выйти. Повторите попытку.', 'warning');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent text-neutral-100">
      <Sidebar roles={roles} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppTopbar
          profile={{ email: session.email, role: session.role }}
          onOpenCreate={() => setCreateOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
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
