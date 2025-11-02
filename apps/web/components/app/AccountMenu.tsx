'use client';

import clsx from 'clsx';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/components/theme/ThemeContext';
import { useUiStore, type WallpaperPreset } from '@/lib/state/ui-store';
import { getUserType, setUserType, type UserType } from '@/lib/auth/roles';
import { useMenuPreferencesStore, MENU_PRESETS } from '@/stores/menuPreferences';
import { leftMenuConfig } from './LeftMenu.config';
import type { DemoProfile } from './AppTopbar';

const themeOptions = [
  {
    id: 'system' as const,
    label: 'Системная',
    description: 'Синхронизация с настройками устройства',
    icon: 'M7 4a5 5 0 0 1 10 0 5 5 0 0 1-5 5 5 5 0 0 1-5-5Zm-1 7a6 6 0 1 1 6 6H6.5A2.5 2.5 0 0 1 4 14.5v-.5A3 3 0 0 1 6 11Z'
  },
  {
    id: 'light' as const,
    label: 'Светлая',
    description: 'Высокая читаемость на светлом фоне',
    icon:
      'M12 5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1Zm0 14a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm7-7a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM4 12a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm12.95-6.364a1 1 0 0 1 0-1.414l1.414-1.415a1 1 0 1 1 1.414 1.415l-1.414 1.414a1 1 0 0 1-1.414 0ZM5.636 17.95a1 1 0 0 1 0 1.414L4.222 20.78a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0ZM18.364 17.95a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 1 1-1.414 1.414l-1.414-1.414a1 1 0 0 1 0-1.414ZM5.636 4.636a1 1 0 0 1-1.414 0L2.808 3.222A1 1 0 0 1 4.222 1.808l1.414 1.414a1 1 0 0 1 0 1.414ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Z'
  },
  {
    id: 'dark' as const,
    label: 'Тёмная',
    description: 'Глубокие цвета и акцентные контуры',
    icon: 'M21 12.79A9 9 0 0 1 11.21 3 6.5 6.5 0 1 0 21 12.79Z'
  }
];

const wallpaperGallery: { id: WallpaperPreset; label: string; preview: string }[] = [
  { id: 'mesh', label: 'Mesh', preview: 'radial-gradient(circle at 20% 20%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 0%, #ec4899 0%, transparent 55%), radial-gradient(circle at 50% 80%, #0ea5e9 0%, transparent 60%)' },
  { id: 'grid', label: 'Сетка', preview: 'linear-gradient(0deg, rgba(99,102,241,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px), radial-gradient(circle at top, rgba(56,189,248,0.35), transparent 65%)' },
  { id: 'halo', label: 'Гало', preview: 'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.4), transparent 60%), radial-gradient(circle at 20% 80%, rgba(236,72,153,0.35), transparent 60%)' },
  { id: 'sunrise', label: 'Рассвет', preview: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 35%, #fca5a5 100%)' },
  { id: 'mint', label: 'Мята', preview: 'linear-gradient(135deg, #ecfccb 0%, #a7f3d0 50%, #bae6fd 100%)' },
  { id: 'lavender', label: 'Лаванда', preview: 'linear-gradient(140deg, #ede9fe 0%, #c4b5fd 45%, #bfdbfe 100%)' },
  { id: 'sands', label: 'Пастель', preview: 'linear-gradient(135deg, #fef9c3 0%, #fde68a 40%, #fbcfe8 100%)' }
];

type AccountMenuProps = {
  profile: DemoProfile;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export default function AccountMenu({ profile, onLogout, isLoggingOut }: AccountMenuProps) {
  const { mode, resolvedTheme, setMode } = useTheme();
  const { bgPreset, setBgPreset } = useUiStore((state) => ({
    bgPreset: state.bgPreset,
    setBgPreset: state.setBgPreset
  }));
  const [isOpen, setOpen] = useState(false);
  const [isWallpaperOpen, setWallpaperOpen] = useState(false);
  const [isMenuCustomizationOpen, setMenuCustomizationOpen] = useState(false);
  const [userType, setUserTypeState] = useState<UserType>(() => getUserType());
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const wallpaperPanelId = useId();
  const menuCustomizationPanelId = useId();
  
  const { visibleMenuIds, toggleMenuVisibility, reset: resetMenuPreferences, isMenuVisible, applyPreset } = useMenuPreferencesStore();

  // Применяем предустановку при первой загрузке, если тип пользователя установлен
  // и настройки меню еще не кастомизированы (для совместимости со старыми настройками)
  useEffect(() => {
    if (userType !== null) {
      const key = userType ?? 'null';
      const preset = MENU_PRESETS[key as keyof typeof MENU_PRESETS];
      const presetSet = new Set(preset);
      const currentSet = new Set(visibleMenuIds);
      // Если текущее меню не соответствует предустановке, применяем её
      // Это происходит только если пользователь не кастомизировал меню вручную
      if (preset.length !== visibleMenuIds.length || 
          preset.some(id => !currentSet.has(id)) ||
          visibleMenuIds.some(id => !presetSet.has(id))) {
        // Применяем предустановку только если это первая загрузка (все меню видимы)
        // или если пользователь только что выбрал тип
        const isFirstLoad = visibleMenuIds.length === leftMenuConfig.length;
        if (isFirstLoad) {
          applyPreset(userType);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType, visibleMenuIds.length, applyPreset]);

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setUserTypeState(type);
    // Применяем предустановку меню для типа пользователя
    const { applyPreset } = useMenuPreferencesStore.getState();
    applyPreset(type);
    // Обновляем страницу для применения изменений
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const initials = useMemo(() => {
    const [first = ''] = profile.email;
    return first.toUpperCase();
  }, [profile.email]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'border-[color:var(--theme-control-border)] bg-[color:var(--theme-control-bg)] text-[color:var(--theme-control-foreground)]',
          'hover:border-[color:var(--theme-control-border-hover)] hover:text-[color:var(--theme-control-foreground-hover)]'
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label="Меню аккаунта"
      >
        {initials}
      </button>
      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Настройки аккаунта"
          className="absolute right-0 z-50 mt-3 w-[26rem] origin-top-right overflow-hidden rounded-2xl border border-[color:var(--surface-border-strong)] bg-[color:var(--surface-popover)] shadow-2xl"
        >
          <div className="border-b border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-primary)]">{profile.email}</p>
                <p className="text-xs text-[color:var(--text-secondary)]">{profile.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                disabled={isLoggingOut}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  isLoggingOut
                    ? 'cursor-not-allowed border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] text-[color:var(--text-tertiary)]'
                    : 'border-[color:var(--button-danger-border)] bg-[color:var(--button-danger-bg)] text-[color:var(--button-danger-foreground)] hover:border-[color:var(--button-danger-border-strong)] hover:bg-[color:var(--button-danger-bg-hover)] focus-visible:outline-[color:var(--button-danger-border-strong)]'
                )}
              >
                {isLoggingOut ? 'Выход…' : 'Выйти'}
              </button>
            </div>
          </div>
          <div className="space-y-4 px-4 py-3">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                  Тип пользователя
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={userType === 'performer'}
                  onClick={() => handleUserTypeChange('performer')}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    userType === 'performer'
                      ? 'border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-foreground)] shadow-sm focus-visible:outline-[color:var(--button-primary-border-strong)]'
                      : 'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] text-[color:var(--text-secondary)] hover:border-[color:var(--button-primary-border)] hover:text-[color:var(--text-primary)] focus-visible:outline-[color:var(--surface-border-strong)]'
                  )}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Исполнитель
                  <span className="text-[10px] text-[color:var(--text-tertiary)]">
                    Маркетплейс и вакансии
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={userType === 'marketer'}
                  onClick={() => handleUserTypeChange('marketer')}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    userType === 'marketer'
                      ? 'border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-foreground)] shadow-sm focus-visible:outline-[color:var(--button-primary-border-strong)]'
                      : 'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] text-[color:var(--text-secondary)] hover:border-[color:var(--button-primary-border)] hover:text-[color:var(--text-primary)] focus-visible:outline-[color:var(--surface-border-strong)]'
                  )}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                  Маркетолог
                  <span className="text-[10px] text-[color:var(--text-tertiary)]">Маркетинг блок</span>
                </button>
              </div>
              {userType && (
                <button
                  type="button"
                  onClick={() => handleUserTypeChange(null)}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] px-3 py-1.5 text-[11px] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
                >
                  Сбросить выбор
                </button>
              )}
            </section>
            <section>
              <button
                type="button"
                onClick={() => setMenuCustomizationOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--accent-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-expanded={isMenuCustomizationOpen}
                aria-controls={menuCustomizationPanelId}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">Кастомизация меню</span>
                <span className="flex items-center gap-2 text-[11px] text-[color:var(--text-tertiary)]">
                  {visibleMenuIds.length} / {leftMenuConfig.length}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className={clsx('h-4 w-4 transition-transform', isMenuCustomizationOpen ? 'rotate-180' : 'rotate-0')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                id={menuCustomizationPanelId}
                className={clsx('space-y-2 pt-3', isMenuCustomizationOpen ? 'mt-1' : 'mt-1 hidden')}
              >
                <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                  {leftMenuConfig.map((section) => {
                    const isVisible = isMenuVisible(section.id);
                    return (
                      <label
                        key={section.id}
                        className={clsx(
                          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition cursor-pointer',
                          isVisible
                            ? 'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] hover:border-[color:var(--accent-border)]'
                            : 'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] opacity-60 hover:opacity-80'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleMenuVisibility(section.id)}
                          className="h-4 w-4 rounded border-[color:var(--surface-border-strong)] accent-[color:var(--accent-fg)]"
                        />
                        <span className="flex-1 text-[color:var(--text-primary)]">{section.label}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetMenuPreferences();
                  }}
                  className="mt-2 w-full rounded-lg border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] px-3 py-1.5 text-[11px] text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
                >
                  Сбросить к полному меню
                </button>
              </div>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">Тема</h3>
                <span className="rounded-full border border-[color:var(--surface-border-subtle)] px-2 py-0.5 text-[11px] text-[color:var(--text-tertiary)]">
                  {mode === 'system' ? 'Авто' : resolvedTheme === 'dark' ? 'Тёмная' : 'Светлая'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={mode === option.id}
                    onClick={() => setMode(option.id)}
                    className={clsx(
                      'flex flex-col items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                      mode === option.id
                        ? 'border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-foreground)] shadow-sm focus-visible:outline-[color:var(--button-primary-border-strong)]'
                        : 'border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] text-[color:var(--text-secondary)] hover:border-[color:var(--button-primary-border)] hover:text-[color:var(--text-primary)] focus-visible:outline-[color:var(--surface-border-strong)]'
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={option.icon} fill="currentColor" />
                    </svg>
                    {option.label}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <button
                type="button"
                onClick={() => setWallpaperOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] px-3 py-2 text-left text-sm font-semibold text-[color:var(--text-primary)] transition hover:border-[color:var(--accent-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                aria-expanded={isWallpaperOpen}
                aria-controls={wallpaperPanelId}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">Обои</span>
                <span className="flex items-center gap-2 text-[11px] text-[color:var(--text-tertiary)]">
                  {wallpaperGallery.length} вариантов
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className={clsx('h-4 w-4 transition-transform', isWallpaperOpen ? 'rotate-180' : 'rotate-0')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
              <div
                id={wallpaperPanelId}
                className={clsx('grid grid-cols-2 gap-3 pt-3', isWallpaperOpen ? 'mt-1' : 'mt-1 hidden')}
              >
                {wallpaperGallery.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBgPreset(item.id)}
                    className={clsx(
                      'relative h-20 overflow-hidden rounded-2xl border text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                      bgPreset === item.id
                        ? 'border-[color:var(--accent-border)] shadow-lg'
                        : 'border-[color:var(--surface-border-subtle)] hover:border-[color:var(--accent-border)]'
                    )}
                    aria-pressed={bgPreset === item.id}
                  >
                    <span
                      className="absolute inset-0"
                      style={{ backgroundImage: item.preview, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      aria-hidden="true"
                    />
                    <span className="absolute inset-x-2 bottom-2 rounded-full bg-[color:var(--surface-chip)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--text-chip)] shadow">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-tertiary)]">
                Скоро
              </h3>
              <div className="space-y-2">
                {[{ label: 'Часовой пояс' }, { label: 'Валюта' }, { label: 'Язык интерфейса' }].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="flex w-full items-center justify-between rounded-xl border border-dashed border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] px-3 py-2 text-left text-sm text-[color:var(--text-tertiary)] opacity-70"
                  >
                    {item.label}
                    <span className="text-[11px] uppercase tracking-[0.2em]">Скоро</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
