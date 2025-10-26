'use client';

import type { ReactNode } from 'react';
import ResponsiveStack from '@/components/common/layout/ResponsiveStack';
import SideDrawer from './SideDrawer';
import ProjectsTopbar from './ProjectsTopbar';
import { useProjectDrawer } from '@/hooks/projects/useProjectDrawer';

export default function ProjectsLayoutShell({ children }: { children: ReactNode }) {
  const { isOpen, entityId, entityType, mode, closeDrawer, getDrawerTitle } = useProjectDrawer();

  return (
    <ResponsiveStack
      as="div"
      gap="xl"
      desktopDirection="column"
      mobileDirection="column"
      className="projects-layout min-h-full"
      data-testid="projects-layout"
    >
      <ProjectsTopbar />
      <ResponsiveStack
        as="div"
        gap="lg"
        breakpoint="(min-width: 1280px)"
        desktopDirection="row"
        mobileDirection="column"
        align="stretch"
        className="projects-layout__content"
        data-testid="projects-layout-content"
      >
        <main className="flex-1 space-y-6" aria-label={getDrawerTitle(entityType)} data-testid="projects-layout-main">
          {children}
        </main>
        <aside
          aria-label="Панель действий раздела проектов"
          className="projects-layout__aside hidden w-full flex-none rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/40 p-6 text-sm text-neutral-500 xl:block"
          data-testid="projects-layout-aside"
        >
          Панель действий появится в следующих релизах.
        </aside>
      </ResponsiveStack>
      <SideDrawer
        open={isOpen}
        onClose={closeDrawer}
        entityType={entityType}
        entityId={entityId}
        mode={mode}
      />
    </ResponsiveStack>
  );
}
