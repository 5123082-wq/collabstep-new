'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUiStore } from '@/lib/state/ui-store';
import { loadSpecialists, loadVacancies } from '@/lib/mock/loaders';
import { toast } from '@/lib/ui/toast';

const backgroundPresets = [
  { id: 'mesh', label: 'Mesh' },
  { id: 'grid', label: 'Grid' },
  { id: 'halo', label: 'Halo' },
  { id: 'bloom', label: 'Bloom' },
  { id: 'mist', label: 'Mist' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'midnight', label: 'Midnight' }
] as const;

const themeOptions = [
  { id: 'light', label: 'Светлая' },
  { id: 'system', label: 'Авто' },
  { id: 'dark', label: 'Тёмная' }
] as const;

type QuickSuggestion = {
  id: string;
  label: string;
  description: string;
  href: string;
  type: 'specialist' | 'vacancy';
};

const iconPaths: Record<string, string> = {
  bell: 'M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm8-6a2 2 0 0 1-2-2v-3a6 6 0 1 0-12 0v3a2 2 0 0 1-2 2h16Z',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 0 4H5a2 2 0 0 1-2-2Zm0 5a2 2 0 0 1 2-2h16v8H5a2 2 0 0 1-2-2v-4Zm13 2a1 1 0 1 0 0 2h3v-2h-3Z',
  user: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z'
};

function ThemeIcon({ variant }: { variant: (typeof themeOptions)[number]['id'] }) {
  if (variant === 'light') {
    return (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m3.64-6.36 1.42 1.42M16.94 16.94l1.42 1.42m0-11.31-1.42 1.42M7.05 16.95 5.64 18.36" />
      </svg>
    );
  }

  if (variant === 'dark') {
    return (
      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="4" />
      <path d="M19 12h3M2 12h3M12 2.5V1M12 23v-1.5M5.64 5.64 4.22 4.22m15.56 0-1.42 1.42m0 12.72 1.42 1.42m-15.56 0 1.42-1.42" />
    </svg>
  );
}

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

export type DemoProfile = {
  email: string;
  role: 'admin' | 'user';
};

type AppTopbarProps = {
  onOpenCreate: () => void;
  onOpenPalette: () => void;
  profile: DemoProfile;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function AppTopbar({ onOpenCreate, onOpenPalette, profile, onLogout, isLoggingOut }: AppTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { bgPreset, setBgPreset, theme, setTheme } = useUiStore((state) => ({
    bgPreset: state.bgPreset,
    setBgPreset: state.setBgPreset,
    theme: state.theme,
    setTheme: state.setTheme
  }));
  const { items: specialistItems } = loadSpecialists();
  const { items: vacancyItems } = loadVacancies();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const hintId = `${listboxId}-hint`;
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const backgroundClassNames = useMemo(() => backgroundPresets.map((preset) => `app-bg-${preset.id}`), []);

  const suggestions: QuickSuggestion[] = useMemo(() => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      return [];
    }
    const mask = trimmed[0];
    const keyword = trimmed.slice(1).trim().toLowerCase();
    if (mask === '@') {
      if (!keyword) {
        return [];
      }
      return specialistItems
        .filter((specialist) => {
          const haystack = [
            specialist.name,
            specialist.role,
            specialist.skills.join(' ')
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(keyword);
        })
        .slice(0, 6)
        .map<QuickSuggestion>((specialist) => ({
          id: `specialist-${specialist.id}`,
          label: specialist.name,
          description: `${specialist.role} · ${specialist.skills.slice(0, 3).join(', ')}`,
          href: `/p/${specialist.handle}`,
          type: 'specialist'
        }));
    }
    if (mask === '#') {
      if (!keyword) {
        return [];
      }
      return vacancyItems
        .filter((vacancy) => {
          const haystack = [
            vacancy.title,
            vacancy.project,
            vacancy.summary,
            vacancy.tags.join(' ')
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(keyword);
        })
        .slice(0, 6)
        .map<QuickSuggestion>((vacancy) => ({
          id: `vacancy-${vacancy.id}`,
          label: vacancy.title,
          description: `${vacancy.project} · ${vacancy.level}`,
          href: `/app/marketplace/vacancies/${vacancy.id}`,
          type: 'vacancy'
        }));
    }
    return [];
  }, [searchValue, specialistItems, vacancyItems]);

  useEffect(() => {
    setActiveSuggestion(0);
  }, [suggestions]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };
    setSystemPrefersDark(media.matches);
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion: QuickSuggestion) => {
      router.push(suggestion.href);
      setSearchValue('');
      setSearchFocused(false);
      setActiveSuggestion(0);
      inputRef.current?.blur();
    },
    [router]
  );

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenPalette();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveSuggestion((index) => (index + 1) % Math.max(suggestions.length, 1));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveSuggestion((index) => (index - 1 + Math.max(suggestions.length, 1)) % Math.max(suggestions.length, 1));
        return;
      }
      if (event.key === 'Enter') {
        if (suggestions.length > 0) {
          event.preventDefault();
          const target = suggestions[activeSuggestion];
          if (target) {
            handleSelectSuggestion(target);
          }
        }
        return;
      }
      if (event.key === 'Escape') {
        setSearchValue('');
        setSearchFocused(false);
        setActiveSuggestion(0);
        inputRef.current?.blur();
      }
    },
    [activeSuggestion, handleSelectSuggestion, onOpenPalette, suggestions]
  );

  const trimmedQuery = searchValue.trim();
  const maskSymbol = trimmedQuery[0];
  const maskKeyword = trimmedQuery.slice(1).trim();
  const isMaskQuery = maskSymbol === '@' || maskSymbol === '#';
  const showSuggestionList = isSearchFocused && suggestions.length > 0;
  const showMaskHint = isSearchFocused && isMaskQuery && maskKeyword.length === 0;
  const showEmptyState = isSearchFocused && isMaskQuery && maskKeyword.length > 0 && suggestions.length === 0;
  const showSuggestionPanel = showSuggestionList || showMaskHint || showEmptyState;
  const activeSuggestionId = showSuggestionList
    ? `${listboxId}-option-${suggestions[activeSuggestion]?.id ?? activeSuggestion}`
    : undefined;
  const currentSubscriptionLabel = 'Подписка Pro';
  const resolvedTheme = theme === 'system' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const body = document.body;
    body.classList.remove(...backgroundClassNames);
    body.classList.add(`app-bg-${bgPreset}`);
    return () => {
      body.classList.remove(...backgroundClassNames);
    };
  }, [bgPreset, pathname, backgroundClassNames]);

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
              ref={inputRef}
              type="search"
              value={searchValue}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setActiveSuggestion(0);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                if (typeof window !== 'undefined') {
                  window.setTimeout(() => setSearchFocused(false), 120);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Поиск по платформе…"
              aria-expanded={showSuggestionPanel}
              aria-autocomplete="list"
              aria-controls={showSuggestionList ? listboxId : undefined}
              aria-activedescendant={activeSuggestionId}
              aria-describedby={showMaskHint || showEmptyState ? hintId : undefined}
              role="combobox"
              aria-haspopup="listbox"
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 px-5 py-3 text-sm text-neutral-100 shadow-inner shadow-neutral-950/20 transition focus:border-indigo-500 focus:outline-none"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={onOpenPalette}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-700 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-500 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 md:flex"
            >
              ⌘K
            </button>
            {showSuggestionPanel && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-xl">
                {showSuggestionList ? (
                  <ul id={listboxId} role="listbox" className="max-h-72 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={index === activeSuggestion}
                          id={`${listboxId}-option-${suggestion.id}`}
                          onMouseEnter={() => setActiveSuggestion(index)}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                            index === activeSuggestion ? 'bg-indigo-500/10' : 'bg-transparent'
                          }`}
                        >
                          <div>
                            <p className="font-medium text-neutral-100">{suggestion.label}</p>
                            <p className="text-xs text-neutral-500">{suggestion.description}</p>
                          </div>
                          <span className="text-[11px] uppercase tracking-wide text-neutral-500">
                            {suggestion.type === 'specialist' ? 'специалист' : 'вакансия'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div id={hintId} className="px-4 py-3 text-sm text-neutral-400">
                    {showMaskHint
                      ? 'Введите текст после маски @ или #, чтобы искать специалистов или вакансии.'
                      : 'Совпадений не найдено. Попробуйте изменить запрос.'}
                  </div>
                )}
              </div>
            )}
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
          <button
            type="button"
            onClick={() => toast('Раздел тарифов скоро появится в демо-версии платформы', 'info')}
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/60 bg-indigo-500/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 9.5 7 5l5 5 5-5 3 4.5V20H4z" />
              <path d="M4 15h16" />
            </svg>
            {currentSubscriptionLabel}
          </button>
          <IconButton icon="bell" label="Уведомления" />
          <IconButton icon="chat" label="Сообщения" />
          <IconButton icon="wallet" label="Кошелёк" />
          <IconButton icon="user" label="Профиль" />
        </div>
        <div className="flex flex-wrap items-center gap-1">
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
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className={clsx(
              'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
              isLoggingOut
                ? 'cursor-not-allowed border-neutral-800 bg-neutral-900/60 text-neutral-500'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-indigo-500/40 hover:text-white'
            )}
          >
            {isLoggingOut ? 'Выход…' : 'Выйти'}
          </button>
          <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1">
            {themeOptions.map((option) => {
              const isSelected = theme === option.id;
              const title =
                option.id === 'system'
                  ? `Авто · сейчас ${resolvedTheme === 'dark' ? 'тёмная' : 'светлая'}`
                  : option.label;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                    isSelected
                      ? 'bg-indigo-500/20 text-indigo-100 ring-1 ring-inset ring-indigo-500/50'
                      : 'text-neutral-400 hover:text-neutral-100'
                  )}
                  aria-pressed={isSelected}
                  title={title}
                >
                  <ThemeIcon variant={option.id} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
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
