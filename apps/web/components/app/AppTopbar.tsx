'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUiStore } from '@/lib/state/ui-store';

const backgroundPresets = [
  { id: 'mesh', label: 'Mesh' },
  { id: 'grid', label: 'Grid' },
  { id: 'halo', label: 'Halo' }
] as const;

const iconPaths: Record<string, string> = {
  bell: 'M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm8-6a2 2 0 0 1-2-2v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-2 2h16Z',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2Zm0 5a2 2 0 0 1 2-2h16v8H5a2 2 0 0 1-2-2v-4Zm13 2a1 1 0 1 0 0 2h3v-2h-3Z',
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z'
};

type DemoProfile = {
  email: string;
  role: 'admin' | 'user';
};

function resolveRoleLabel(role: DemoProfile['role']): string {
  return role === 'admin' ? 'Админ' : 'Пользователь';
}

function IconButton({ icon, label }: { icon: keyof typeof iconPaths; label: string }) {
  return (
    <button
      type="button"
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-300 transition hover:border-indigo-500/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      aria-label={label}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 transition group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPaths[icon]} fill="currentColor" />
      </svg>
    </button>
  );
}

type AppTopbarProps = {
  onOpenCreate: () => void;
  onOpenPalette: () => void;
};

export default function AppTopbar({ onOpenCreate, onOpenPalette }: AppTopbarProps) {
  const pathname = usePathname();
  const { bgPreset, setBgPreset } = useUiStore((state) => ({ bgPreset: state.bgPreset, setBgPreset: state.setBgPreset }));
  const [profile, setProfile] = useState<DemoProfile | null>(null);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('app-bg-mesh', 'app-bg-grid', 'app-bg-halo');
    body.classList.add(`app-bg-${bgPreset}`);
    return () => {
      body.classList.remove('app-bg-mesh', 'app-bg-grid', 'app-bg-halo');
    };
  }, [bgPreset, pathname]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include', signal: controller.signal });

        if (!response.ok) {
          setProfile(null);
          return;
        }

        const data = (await response.json()) as Partial<DemoProfile>;

        if (data && typeof data.email === 'string' && (data.role === 'admin' || data.role === 'user')) {
          setProfile({ email: data.email, role: data.role });
        } else {
          setProfile(null);
        }
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') {
          return;
        }
        setProfile(null);
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900/60 bg-neutral-950/80 backdrop-blur">
      <div className="flex items-center justify-between gap-6 px-6 py-4">
        <div className="flex flex-1 items-center gap-3">
          <form
            className="relative hidden max-w-md flex-1 md:block"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="app-search" className="sr-only">
              Поиск по приложению
            </label>
            <input
              id="app-search"
              type="search"
              placeholder="Поиск по платформе…"
              onFocus={onOpenPalette}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-3 text-sm text-neutral-100 shadow-inner shadow-neutral-950/20 transition focus:border-indigo-500 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-700 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-500 md:flex">
              ⌘K
            </span>
          </form>
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/50 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <span className="text-lg leading-none">+</span>
            Создать
          </button>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <IconButton icon="bell" label="Уведомления" />
          <IconButton icon="chat" label="Сообщения" />
          <IconButton icon="wallet" label="Кошелёк" />
          <IconButton icon="user" label="Профиль" />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {profile ? (
            <span
              data-testid="role-badge"
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100',
                profile.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-100 ring-1 ring-inset ring-amber-500/50'
                  : 'bg-indigo-500/20 text-indigo-100 ring-1 ring-inset ring-indigo-500/50'
              )}
            >
              {resolveRoleLabel(profile.role)}
            </span>
          ) : null}
          {backgroundPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setBgPreset(preset.id)}
              className={clsx(
                'rounded-xl border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                bgPreset === preset.id
                  ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-100'
                  : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-indigo-500/40 hover:text-white'
              )}
              aria-pressed={bgPreset === preset.id}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
