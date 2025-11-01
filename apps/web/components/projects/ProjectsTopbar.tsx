'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PROJECTS_TOPBAR_CLASSNAMES } from '@/components/common/layoutPresets';
import { isActivePath, TOPBAR_LINKS } from './projectsTopbar.config';

function ProjectsTopbarComponent() {
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
      </div>
    </header>
  );
}

const ProjectsTopbar = memo(ProjectsTopbarComponent);
ProjectsTopbar.displayName = 'ProjectsTopbar';

export default ProjectsTopbar;
export { TOPBAR_LINKS, isActivePath };
