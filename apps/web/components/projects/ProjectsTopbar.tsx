'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, type SVGProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PROJECTS_TOPBAR_CLASSNAMES } from '@/components/common/layoutPresets';
import { isActivePath, TOPBAR_LINKS } from './projectsTopbar.config';

const QUICK_FILTERS = [
  { id: 'stage-discovery', label: 'Discovery', disabled: true },
  { id: 'stage-build', label: 'Разработка', disabled: true },
  { id: 'status-active', label: 'Активные', disabled: true }
];

type ProjectsTopbarProps = {
  searchPlaceholder?: string;
};

function ProjectsTopbarComponent({ searchPlaceholder = 'Поиск по проектам' }: ProjectsTopbarProps) {
  const pathname = usePathname();

  const links = useMemo(
    () =>
      TOPBAR_LINKS.map((link) => ({
        ...link,
        active: isActivePath(pathname, link)
      })),
    [pathname]
  );

  return (
    <header className="rounded-3xl border border-neutral-900/70 bg-neutral-950/80 px-4 py-4 shadow-sm backdrop-blur">
      <div className={PROJECTS_TOPBAR_CLASSNAMES.container}>
        <nav aria-label="Навигация по разделу проектов" className={PROJECTS_TOPBAR_CLASSNAMES.nav}>
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                PROJECTS_TOPBAR_CLASSNAMES.link,
                'font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
                link.active
                  ? 'bg-indigo-500 text-white shadow'
                  : 'border border-transparent bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100'
              )}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={PROJECTS_TOPBAR_CLASSNAMES.actions}>
          <div className={PROJECTS_TOPBAR_CLASSNAMES.search}>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label="Поиск по проектам"
              disabled
            />
          </div>
          <div className={PROJECTS_TOPBAR_CLASSNAMES.quickFilters}>
            {QUICK_FILTERS.map((filter) => (
              <span
                key={filter.id}
                className="inline-flex items-center rounded-full border border-dashed border-neutral-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500"
              >
                {filter.label}
              </span>
            ))}
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-600">Скоро</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const ProjectsTopbar = memo(ProjectsTopbarComponent);
ProjectsTopbar.displayName = 'ProjectsTopbar';

export default ProjectsTopbar;
export { TOPBAR_LINKS, isActivePath };

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}
