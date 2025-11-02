'use client';

import type { ReactNode } from 'react';
import SideDrawer from './SideDrawer';
import { useProjectDrawer } from '@/hooks/projects/useProjectDrawer';
import DashboardSplitLayout from '@/components/common/DashboardSplitLayout';
import { cn } from '@/lib/utils';

export default function ProjectsLayoutShell({ children }: { children: ReactNode }) {
  const { isOpen, entityId, entityType, mode, closeDrawer, getDrawerTitle } = useProjectDrawer();

  return (
    <>
      <DashboardSplitLayout
        topbar={null}
        main={children}
        mainProps={{
          'aria-label': getDrawerTitle(entityType)
        }}
        asideProps={{
          'aria-label': 'Панель действий раздела проектов',
          className: cn(
            'rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/40 p-6 text-sm text-neutral-500'
          )
        }}
        aside={<span>Панель действий появится в следующих релизах.</span>}
      />
      <SideDrawer
        open={isOpen}
        onClose={closeDrawer}
        entityType={entityType}
        entityId={entityId}
        mode={mode}
      />
    </>
  );
}
