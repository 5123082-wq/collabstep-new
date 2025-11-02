'use client';

import type { ReactNode } from 'react';
import SideDrawer from './SideDrawer';
import { useProjectDrawer } from '@/hooks/projects/useProjectDrawer';
import DashboardSplitLayout from '@/components/common/DashboardSplitLayout';

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
