'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo, useState, type SVGProps } from 'react';
import SectionSurface from '@/components/common/SectionSurface';
import ResponsiveStack from '@/components/common/layout/ResponsiveStack';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { isActivePath, TOPBAR_LINKS } from './projectsTopbar.config';

const QUICK_FILTERS = [
  { id: 'stage-discovery', label: 'Discovery', disabled: true },
  { id: 'stage-build', label: 'Разработка', disabled: true },
  { id: 'status-active', label: 'Активные', disabled: true }
];

function ProjectsTopbarComponent() {
  const pathname = usePathname();
  const isTablet = useMediaQuery('(min-width: 768px)');
  
  const links = useMemo(
    () =>
      TOPBAR_LINKS.map((link) => ({
        ...link,
        active: isActivePath(pathname, link)
      })),
    [pathname]
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const renderNavLinks = (linkClassName?: string) =>
    links.map((link) => (
      <Link
        key={link.id}
        href={link.href}
        className={cn(
          'projects-topbar__link inline-flex items-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
          link.active
            ? 'projects-topbar__link--active'
            : 'projects-topbar__link--inactive',
          linkClassName
        )}
        aria-current={link.active ? 'page' : undefined}
        onClick={() => {
          setMenuOpen(false);
        }}
      >
        {link.label}
      </Link>
    ));

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
        <div className="projects-topbar__nav-wrapper">
          {isTablet ? (
            <nav
              aria-label="Навигация по разделу проектов"
              className="projects-topbar__nav layout-inline-scroll"
              data-testid="projects-topbar-nav"
            >
              {renderNavLinks()}
            </nav>
          ) : (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="top">
              <div className="projects-topbar__menu">
                <button
                  type="button"
                  className="projects-topbar__menu-trigger"
                  aria-haspopup="dialog"
                  aria-expanded={menuOpen}
                  aria-label="Открыть навигацию по проектам"
                  data-testid="projects-topbar-menu-trigger"
                  onClick={() => setMenuOpen(true)}
                >
                  <MenuIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="projects-topbar__menu-label">Меню</span>
                </button>
                <nav className="projects-topbar__nav-hidden" aria-hidden>
                  {renderNavLinks('projects-topbar__link--ghost')}
                </nav>
              </div>
              <SheetContent side="top" className="projects-topbar__sheet" aria-label="Навигация по разделу проектов">
                <SheetHeader className="projects-topbar__sheet-header">
                  <SheetTitle className="projects-topbar__sheet-title">Раздел проектов</SheetTitle>
                </SheetHeader>
                <div className="projects-topbar__sheet-nav" data-testid="projects-topbar-sheet-nav">
                  {renderNavLinks('projects-topbar__sheet-link')}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
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

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
