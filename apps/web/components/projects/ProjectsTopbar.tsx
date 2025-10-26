'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, type SVGProps } from 'react';
import SectionSurface from '@/components/common/SectionSurface';
import ResponsiveStack from '@/components/common/layout/ResponsiveStack';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
    <SectionSurface
      as="header"
      padding="none"
      className="projects-topbar"
      data-testid="projects-topbar"
    >
      <ResponsiveStack
        as="div"
        gap="md"
        breakpoint="(min-width: 1024px)"
        desktopDirection="row"
        mobileDirection="column"
        desktopJustify="between"
        desktopAlign="center"
        className="projects-topbar__inner"
        data-testid="projects-topbar-layout"
      >
        <nav
          aria-label="Навигация по разделу проектов"
          className="projects-topbar__nav layout-inline-scroll"
          data-testid="projects-topbar-nav"
        >
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                'projects-topbar__link inline-flex items-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
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
        <ResponsiveStack
          as="div"
          gap="sm"
          breakpoint="(min-width: 1024px)"
          desktopDirection="row"
          mobileDirection="column"
          mobileAlign="stretch"
          desktopAlign="center"
          mobileJustify="start"
          desktopJustify="start"
          className="projects-topbar__tools"
          data-testid="projects-topbar-tools"
        >
          <div className="projects-topbar__search relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="projects-topbar__search-input pl-9"
              aria-label="Поиск по проектам"
              disabled
            />
          </div>
          <div
            className="projects-topbar__filters layout-inline-scroll"
            data-testid="projects-topbar-filters"
          >
            {QUICK_FILTERS.map((filter) => (
              <span
                key={filter.id}
                className="projects-topbar__filter inline-flex items-center rounded-full border border-dashed border-neutral-800 text-xs font-medium uppercase tracking-wide text-neutral-500"
              >
                {filter.label}
              </span>
            ))}
            <span className="projects-topbar__soon-label text-xs uppercase text-neutral-600">
              Скоро
            </span>
          </div>
        </ResponsiveStack>
      </ResponsiveStack>
    </SectionSurface>
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
