'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { getUserRoles } from '@/lib/auth/roles';
import { writeProjectState } from '@/lib/project/storage';
import { getProjectMenuForRoles, type ProjectMenuItem } from './ProjectMenu.config';

function isActive(pathname: string, projectId: string, item: ProjectMenuItem): boolean {
  const target = `/project/${projectId}/${item.slug}`;
  return pathname === target || pathname.startsWith(`${target}/`);
}

type ProjectSidebarProps = {
  projectId: string;
};

export default function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  const roles = useMemo(() => getUserRoles(), []);
  const menu = useMemo(() => getProjectMenuForRoles(roles), [roles]);

  const activeEntry = useMemo(() => menu.find((item) => isActive(pathname, projectId, item)), [menu, pathname, projectId]);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    writeProjectState(projectId, { lastTab: activeEntry.slug });
  }, [activeEntry, projectId]);

  return (
    <aside className="flex h-full min-h-screen w-[288px] flex-shrink-0 flex-col border-r border-neutral-900 bg-neutral-950/90 px-4 py-8">
      <div className="space-y-2 text-sm text-neutral-400">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Проект</p>
        <p className="text-xs text-neutral-500">Навигация по рабочим модулям проекта.</p>
      </div>
      <nav className="mt-6 space-y-4" aria-label="Навигация по проекту">
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
