'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
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
  const { expandedGroups, toggleGroup, isSidebarCollapsed, toggleSidebarCollapsed, setSidebarCollapsed } = useUiStore(
    (state) => ({
      expandedGroups: state.expandedGroups,
      toggleGroup: state.toggleGroup,
      isSidebarCollapsed: state.isSidebarCollapsed,
      toggleSidebarCollapsed: state.toggleSidebarCollapsed,
      setSidebarCollapsed: state.setSidebarCollapsed
    })
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  return (
    <aside
      className={clsx(
        'sidebar flex h-full flex-shrink-0 flex-col overflow-hidden border-r border-neutral-900/60 bg-neutral-950/80 transition-[width] duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-16 px-2 py-4' : 'w-[288px] px-4 py-6'
      )}
    >
      <div
        className={clsx(
          'flex items-center',
          isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'
        )}
      >
        {!isSidebarCollapsed && (
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Навигация</p>
        )}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-pressed={isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          className={clsx(
            'rounded-full border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-400 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
            isSidebarCollapsed ? 'px-2 py-2' : 'px-3 py-1'
          )}
        >
          {isSidebarCollapsed ? '⟩' : '⟨'}
        </button>
      </div>
      <nav
        aria-label="Навигация приложения"
        className={clsx(
          'mt-6 flex flex-1 flex-col gap-2 overflow-y-auto transition-[padding] duration-200',
          isSidebarCollapsed ? 'items-center' : 'pr-2'
        )}
      >
        {menu.map((section) => {
          const hasChildren = Boolean(section.children?.length);
          const isExpanded = isSidebarCollapsed || expandedGroups.includes(section.id) || !section.children;
          const isActive = (href?: string) => Boolean(href && normalizedPath.startsWith(href));
          const sectionIsActive =
            isActive(section.href) ||
            (hasChildren && section.children?.some((child) => child.type !== 'divider' && isActive(child.href)));

          if (isSidebarCollapsed) {
            return (
              <div key={section.id} className="group relative pr-4">
                {section.href ? (
                  <Link
                    href={section.href}
                    aria-label={section.label}
                    className={clsx(
                      'flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-neutral-300 transition hover:border-neutral-800/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                      sectionIsActive && 'border-indigo-500/40 bg-indigo-500/10 text-white'
                    )}
                  >
                    <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                  </Link>
                ) : (
                  <div
                    className={clsx(
                      'flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800/60 bg-neutral-900/60 text-neutral-400'
                    )}
                    aria-label={section.label}
                  >
                    <MenuIcon name={(section.icon ?? 'dashboard') as IconName} />
                  </div>
                )}
                {hasChildren && (
                  <div
                    className="pointer-events-none absolute left-full top-0 z-30 min-w-[220px] translate-x-2 overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950/95 shadow-xl opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                    role="group"
                    aria-label={`Подменю ${section.label}`}
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-neutral-200">{section.label}</p>
                    </div>
                    <ul className="flex flex-col gap-1 px-2 pb-3">
                      {section.children?.map((child) => {
                        if (child.type === 'divider') {
                          return (
                            <li key={child.id} role="separator" className="my-2 border-t border-neutral-800/70" />
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
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={section.id} className="rounded-2xl border border-transparent hover:border-neutral-800/80">
              <div className="flex items-center justify-between px-3 py-2">
                {section.href ? (
                  <Link
                    href={section.href}
                    className={clsx(
                      'flex flex-1 items-center gap-3 text-sm font-semibold text-neutral-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                      sectionIsActive && 'text-white'
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
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
