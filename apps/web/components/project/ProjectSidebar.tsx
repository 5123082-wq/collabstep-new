'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import type { UserRole } from '@/lib/auth/roles';
import { writeProjectState } from '@/lib/project/storage';
import { getProjectMenuForRoles, type ProjectMenuItem } from './ProjectMenu.config';

function isActive(pathname: string, projectId: string, item: ProjectMenuItem): boolean {
  const target = `/project/${projectId}/${item.slug}`;
  return pathname === target || pathname.startsWith(`${target}/`);
}

type ProjectSidebarProps = {
  projectId: string;
  roles: UserRole[];
  className?: string;
};

export default function ProjectSidebar({ projectId, roles, className }: ProjectSidebarProps) {
  const pathname = usePathname();
  const menu = useMemo(() => getProjectMenuForRoles(roles), [roles]);

  const activeEntry = useMemo(() => menu.find((item) => isActive(pathname, projectId, item)), [menu, pathname, projectId]);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    writeProjectState(projectId, { lastTab: activeEntry.slug });
  }, [activeEntry, projectId]);

  return (
    <aside
      className={clsx(
        'project-sidebar flex h-full w-full flex-shrink-0 flex-col gap-6 rounded-3xl border border-neutral-900 bg-neutral-950/80 px-5 py-6 shadow-[0_0_30px_rgba(0,0,0,0.25)] xl:max-w-[288px]',
        className
      )}
    >
      <div className="space-y-2 text-sm text-neutral-400">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Проект</p>
        <p className="text-xs text-neutral-500">Навигация по рабочим модулям проекта.</p>
      </div>
      <nav className="space-y-4" aria-label="Навигация по проекту">
        {menu.map((item) => {
          const active = activeEntry?.id === item.id;
          return (
            <div key={item.id} className="space-y-2">
              <Link
                href={`/project/${projectId}/${item.slug}`}
                className={`flex w-full flex-col rounded-2xl border px-4 py-3 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                  active
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-100'
                    : 'border-transparent bg-neutral-900/50 text-neutral-300 hover:border-indigo-500/30 hover:text-white'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="text-xs text-neutral-500">{item.description}</span>
              </Link>
              {active && item.tabs.length > 0 && (
                <ul className="pl-4">
                  {item.tabs.map((tab) => (
                    <li key={tab.id}>
                      <Link
                        href={`/project/${projectId}/${item.slug}#${tab.id}`}
                        className="block rounded-xl px-3 py-2 text-xs text-neutral-400 transition hover:bg-indigo-500/10 hover:text-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                      >
                        {tab.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
