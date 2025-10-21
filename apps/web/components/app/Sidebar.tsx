'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { buildLeftMenu } from '@/lib/nav/menu-builder';
import type { UserRole } from '@/lib/auth/roles';
import { useUiStore } from '@/lib/state/ui-store';

const iconMap: Record<string, string> = {
  dashboard: 'M4 4h16v16H4z',
  projects: 'M4 6h16M4 12h16M4 18h10',
  marketplace: 'M3 7h18l-2 12H5L3 7Zm5 0V5a4 4 0 0 1 8 0v2',
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
  performers: 'M4 7h4a4 4 0 0 1 8 0h4v12H4V7Zm6 0h4a2 2 0 1 0-4 0Zm-2 6a2 2 0 1 1 4 0v2H8v-2Zm6 0a2 2 0 1 1 4 0v2h-4v-2Z',
  overview: 'M4 4h16v16H4z',
  tasks: 'M6 4h12a2 2 0 0 1 2 2v14l-8-3-8 3V6a2 2 0 0 1 2-2Zm0 2v11l6-2.25L18 17V6H6Z',
  calendar: 'M6 5h12a2 2 0 0 1 2 2v12H4V7a2 2 0 0 1 2-2Zm0 4h12M16 3v4M8 3v4',
  team: 'M9 7a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-5 12v-1c0-2.761 3.134-5 7-5s7 2.239 7 5v1H4Zm14-9a2.5 2.5 0 1 0-2.121-3.872A5.5 5.5 0 0 1 18 10Zm-12 0a5.5 5.5 0 0 1-1.879-3.872A2.5 2.5 0 1 0 6 10Z',
  files: 'M6 3h9l5 5v13H6V3Zm9 5h5',
  analytics: 'M5 14h2v6H5v-6Zm6-4h2v10h-2V10Zm6 2h2v8h-2v-8Z',
  automations: 'M12 4 14.5 7h4l-2 3 2 3h-4L12 16l-2.5-3h-4l2-3-2-3h4L12 4Z',
  modules: 'M4 9l8-4 8 4-8 4-8-4Zm0 6 8 4 8-4-8-4-8 4Zm8-2 8-4',
  integrations: 'M7 3h4v4H7V3Zm6 0h4v4h-4V3ZM7 17h4v4H7v-4Zm6 0h4v4h-4v-4ZM5 9h14v6H5V9Z',
  settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6 1.6 3 3.4.4-2.4 2.4.4 3.4L12 14l-3 1.2.4-3.4-2.4-2.4 3.4-.4L12 2Z'
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

  return (
    <aside className="hidden h-full w-[288px] flex-col border-r border-neutral-900/60 bg-neutral-950/80 px-4 py-6 lg:flex">
      <div className="px-2">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Навигация</p>
      </div>
      <nav aria-label="Навигация приложения" className="mt-6 flex flex-1 flex-col gap-2 overflow-y-auto pr-2">
        {menu.map((section) => {
          const isExpanded = expandedGroups.includes(section.id) || !section.children;
          const hasChildren = Boolean(section.children?.length);
          const isActive = (href?: string) => Boolean(href && normalizedPath.startsWith(href));

          return (
            <div key={section.id} className="rounded-2xl border border-transparent hover:border-neutral-800/80">
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
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
