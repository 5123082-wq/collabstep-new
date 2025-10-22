'use client';

import type { ReactNode } from 'react';
import SideDrawer from './SideDrawer';
import ProjectsTopbar from './ProjectsTopbar';
import { useProjectsDrawerStore, getDrawerTitle } from '@/stores/projectsDrawer';

export default function ProjectsLayoutShell({ children }: { children: ReactNode }) {
  const { isOpen, entityId, entityType, mode, closeDrawer } = useProjectsDrawerStore((state) => ({
    isOpen: state.isOpen,
    entityId: state.entityId,
    entityType: state.entityType,
    mode: state.mode,
    closeDrawer: state.closeDrawer
  }));

  return (
    <div className="flex min-h-full flex-col gap-6">
      <ProjectsTopbar />
      <div className="flex flex-1 flex-col gap-6 xl:flex-row">
        <main className="flex-1 space-y-6" aria-label={getDrawerTitle(entityType)}>
          {children}
        </main>
        <aside
          aria-label="Панель действий раздела проектов"
          className="hidden w-full max-w-xs flex-none rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/40 p-6 text-sm text-neutral-500 xl:block"
        >
          Панель действий появится в следующих релизах.
        </aside>
      </div>
      <SideDrawer
        open={isOpen}
        onClose={closeDrawer}
        entityType={entityType}
        entityId={entityId}
        mode={mode}
      />
    </div>
  );
}
