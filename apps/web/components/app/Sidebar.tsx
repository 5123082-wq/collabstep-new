'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEvent as ReactFocusEvent, MouseEvent as ReactMouseEvent } from 'react';
import { buildLeftMenu } from '@/lib/nav/menu-builder';
import type { UserRole } from '@/lib/auth/roles';
import { useUiStore } from '@/lib/state/ui-store';

const iconMap: Record<string, string> = {
  dashboard: 'M4 4h16v16H4z',
  projects: 'M4 6h16M4 12h16M4 18h10',
  marketplace: 'M3 7h18l-2 12H5L3 7Zm5 0V5a4 4 0 0 1 8 0v2',
  marketing: 'M4 4h16v4H4V4Zm0 6h6v8H4v-8Zm8 0h6v8h-6v-8Zm-2-6h4v2h-4V4Z',
  ai: 'M12 3a4 4 0 0 1 4 4 4 4 0 0 0 4 4 4 4 0 1 1-4 4 4 4 0 0 0-4 4 4 4 0 0 1-4-4 4 4 0 0 0-4-4 4 4 0 0 1 4-4 4 4 0 0 0 4-4',
  community: 'M8 21a4 4 0 1 1 8 0H8Zm9-9a4 4 0 1 0-6-3.464A4 4 0 1 0 7 12c0 2.761 4 4 4 4s4-1.239 4-4Z',
  finance: 'M3 5h18v4H3V5Zm2 6h14v8H5v-8Zm4 2v4m6-4v4',
  docs: 'M6 3h9l5 5v13H6V3Zm9 5h5',
  messages: 'M20 19H4l0-14h16v14Zm0 0-5-5',
  notifications: 'M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z',
  profile: 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4Z',
  org: 'M4 21V9l8-6 8 6v12H4Zm4-10h8v10H8V11Z',
  support: 'M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3Zm0 16h.01',
  admin: 'M12 2 2 7l10 5 10-5-10-5Zm0 9.91L4 8.27V17l8 5 8-5V8.27l-8 3.64Z',
  performers: 'M4 7h4a4 4 0 0 1 8 0h4v12H4V7Zm6 0h4a2 2 0 1 0-4 0Zm-2 6a2 2 0 1 1 4 0v2H8v-2Zm6 0a2 2 0 1 1 4 0v2h-4v-2Z'
};

type IconName = keyof typeof iconMap;

function MenuIcon({ name }: { name: IconName }) {
  return (
    <svg className="h-4 w-4 flex-none text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d={iconMap[name]} fill="currentColor" />
    </svg>
  );
}

type SidebarProps = {
  roles: UserRole[];
};

export default function Sidebar({ roles }: SidebarProps) {
  const pathname = usePathname();
  const [normalizedPath = ''] = (pathname ?? '').split('?');
  const menu = useMemo(() => buildLeftMenu(roles), [roles]);
  const { expandedGroups, toggleGroup } = useUiStore((state) => ({
    expandedGroups: state.expandedGroups,
    toggleGroup: state.toggleGroup
  }));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => {
      setActivePopover(null);
    }, 120);
  }, [cancelClose]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    setIsCollapsed(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsCollapsed(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => () => cancelClose(), [cancelClose]);

  useEffect(() => {
    if (!isCollapsed) {
      cancelClose();
      setActivePopover(null);
    }
  }, [cancelClose, isCollapsed]);

  const toggleCollapsed = () => {
    cancelClose();
    setActivePopover(null);
    setIsCollapsed((prev) => !prev);
  };

  const handleCollapsedClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, sectionId: string) => {
      if (!isCollapsed) {
        return;
      }

      if (activePopover !== sectionId) {
        event.preventDefault();
        cancelClose();
        setActivePopover(sectionId);
      }
    },
    [activePopover, cancelClose, isCollapsed]
  );

  return (
    <aside
      className={clsx(
        'flex h-full flex-shrink-0 flex-col border-r border-neutral-900/60 bg-neutral-950/80 py-6 transition-[width] duration-200 ease-in-out',
        isCollapsed ? 'w-[72px] items-center px-2' : 'w-[288px] px-4'
      )}
    >
      <div
        className={clsx(
          'flex w-full items-center px-2',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Навигация</p>}
        <button
          type="button"
          onClick={toggleCollapsed}
          className={clsx(
            'flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
            isCollapsed ? 'h-8 w-8' : 'h-7 w-7'
          )}
          aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          aria-pressed={isCollapsed}
        >
          <span className="text-base leading-none">{isCollapsed ? '›' : '‹'}</span>
        </button>
      </div>
      <nav
        aria-label="Навигация приложения"
        className={clsx('mt-6 flex flex-1 flex-col gap-2 overflow-y-auto', isCollapsed ? 'pr-0' : 'pr-2')}
      >
        {menu.map((section) => {
          const isExpanded = expandedGroups.includes(section.id) || !section.children;
          const hasChildren = Boolean(section.children?.length);
          const isActive = (href?: string) => Boolean(href && normalizedPath.startsWith(href));
          const hasActiveChild = Boolean(
            section.children?.some(
              (child) => child.type !== 'divider' && typeof child.href === 'string' && normalizedPath.startsWith(child.href)
            )
          );
          const sectionIsActive = isActive(section.href) || hasActiveChild;
          const showPopover = isCollapsed && activePopover === section.id;

          const handleMouseEnter = () => {
            if (!isCollapsed) {
              return;
            }
            cancelClose();
            setActivePopover(section.id);
          };

          const handleMouseLeave = () => {
            if (!isCollapsed) {
              return;
            }
            scheduleClose();
          };

          const handleFocus = () => {
            if (!isCollapsed) {
              return;
            }
            cancelClose();
            setActivePopover(section.id);
          };

          const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
            if (!isCollapsed) {
              return;
            }
            const next = event.relatedTarget as Node | null;
            if (!next || !event.currentTarget.contains(next)) {
              scheduleClose();
            }
          };

          return (
            <div
              key={section.id}
              className={clsx(
                'relative',
                !isCollapsed && 'rounded-2xl border border-transparent hover:border-neutral-800/80'
              )}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              {isCollapsed ? (
                <div className="flex justify-center px-1 py-1">
                  {section.href ? (
                    <Link
                      href={section.href}
                      onClick={(event) => handleCollapsedClick(event, section.id)}
                      className={clsx(
                        'flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-300 transition hover:bg-indigo-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                        sectionIsActive && 'bg-indigo-500/20 text-white'
                      )}
                      aria-label={section.label}
                      title={section.label}
                    >
                      <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={clsx(
                        'flex h-11 w-11 items-center justify-center rounded-2xl text-neutral-300 transition hover:bg-indigo-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                        sectionIsActive && 'bg-indigo-500/20 text-white'
                      )}
                      aria-label={section.label}
                      onClick={() => {
                        if (isCollapsed) {
                          cancelClose();
                          setActivePopover((prev) => (prev === section.id ? null : section.id));
                        }
                      }}
                    >
                      <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    {section.href ? (
                      <Link
                        href={section.href}
                        className={clsx(
                          'flex flex-1 items-center gap-3 text-sm font-semibold text-neutral-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                          isActive(section.href) && 'text-white'
                        )}
                      >
                        <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                        {section.label}
                      </Link>
                    ) : (
                      <div className="flex flex-1 items-center gap-3 text-sm font-semibold text-neutral-300">
                        <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                        {section.label}
                      </div>
                    )}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(section.id)}
                        aria-expanded={isExpanded}
                        aria-label={(isExpanded ? 'Свернуть ' : 'Раскрыть ') + section.label}
                        className="rounded-full border border-neutral-800 bg-neutral-900/60 px-2 py-1 text-xs text-neutral-400 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <ul className="space-y-1 px-3 pb-3">
                      {section.children?.map((child) => {
                        if (child.type === 'divider') {
                          return (
                            <li key={child.id} role="separator" className="my-3 border-t border-neutral-800/70" />
                          );
                        }

                        return (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              className={clsx(
                                'block rounded-xl px-3 py-2 text-sm text-neutral-300 transition hover:bg-indigo-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                                normalizedPath === child.href && 'bg-indigo-500/10 text-white'
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
              {isCollapsed && showPopover && (
                <div
                  className="absolute left-full top-1/2 z-30 ml-3 w-60 -translate-y-1/2 rounded-2xl border border-neutral-900/60 bg-neutral-950/90 p-3 shadow-xl backdrop-blur"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                    <span>{section.label}</span>
                  </div>
                  {section.href && (
                    <Link
                      href={section.href}
                      className={clsx(
                        'mt-3 inline-flex w-full items-center justify-between rounded-xl border border-transparent bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:border-indigo-400/40 hover:bg-indigo-500/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                        isActive(section.href) && 'border-indigo-400/40 text-white'
                      )}
                      onClick={() => {
                        cancelClose();
                        setActivePopover(null);
                      }}
                    >
                      Перейти в раздел
                      <span aria-hidden className="text-base leading-none">›</span>
                    </Link>
                  )}
                  {hasChildren && (
                    <ul className="mt-3 space-y-1 text-sm">
                      {section.children?.map((child) => {
                        if (child.type === 'divider') {
                          return <li key={child.id} role="separator" className="my-2 border-t border-neutral-800/60" />;
                        }

                        const childActive = normalizedPath === child.href;
                        return (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              className={clsx(
                                'block rounded-xl px-3 py-2 text-sm text-neutral-300 transition hover:bg-indigo-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                                childActive && 'bg-indigo-500/20 text-white'
                              )}
                              onClick={() => {
                                cancelClose();
                                setActivePopover(null);
                              }}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
