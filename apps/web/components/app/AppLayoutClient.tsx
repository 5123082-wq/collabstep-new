'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShellProvider } from '@/components/app/AppShellContext';
import AppTopbar from '@/components/app/AppTopbar';
import CommandPalette from '@/components/app/CommandPalette';
import ContentContainer from '@/components/app/ContentContainer';
import CreateMenu from '@/components/app/CreateMenu';
import Sidebar from '@/components/app/Sidebar';
import ToastHub from '@/components/app/ToastHub';
import HoverRail from '@/components/right-rail/HoverRail';
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

  const openCreateMenu = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const openCommandPalette = useCallback(() => {
    setPaletteOpen(true);
  }, []);

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

  const railFlagValue =
    process.env.NEXT_PUBLIC_VITE_FEATURE_RAIL ?? process.env.VITE_FEATURE_RAIL ?? '1';
  const isHoverRailEnabled = ['1', 'true', 'on', 'enabled'].includes(railFlagValue.toLowerCase());

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
    <AppShellProvider openCreateMenu={openCreateMenu} openCommandPalette={openCommandPalette}>
      <div className="flex h-screen min-h-0 max-h-screen overflow-hidden bg-transparent text-neutral-100">
        <Sidebar roles={roles} />
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <AppTopbar
            profile={{ email: session.email, role: session.role }}
            onOpenCreate={openCreateMenu}
            onOpenPalette={openCommandPalette}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
          <div className="flex flex-1 min-h-0 overflow-hidden bg-neutral-950/70">
            <ContentContainer hasRailOffset={isHoverRailEnabled}>
              {children}
            </ContentContainer>
          </div>
        </div>
        <CreateMenu open={isCreateOpen} onClose={() => setCreateOpen(false)} />
        <CommandPalette open={isPaletteOpen} onClose={() => setPaletteOpen(false)} />
        <ToastHub />
        {isHoverRailEnabled ? <HoverRail permissions={roles} /> : null}
      </div>
    </AppShellProvider>
  );
}
