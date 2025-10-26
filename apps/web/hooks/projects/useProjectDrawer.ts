'use client';

import { useCallback } from 'react';
import {
  formatDrawerSubtitle,
  getDrawerTitle,
  useProjectDrawerStore,
  type DrawerMode
} from '@/stores/projectDrawer';

export function useProjectDrawer() {
  const { isOpen, entityId, entityType, mode, openDrawer, closeDrawer, reset } = useProjectDrawerStore((state) => ({
    isOpen: state.isOpen,
    entityId: state.entityId,
    entityType: state.entityType,
    mode: state.mode,
    openDrawer: state.openDrawer,
    closeDrawer: state.closeDrawer,
    reset: state.reset
  }));

  const openProject = useCallback(
    (projectId: string, drawerMode: DrawerMode = 'view') => {
      openDrawer('project', projectId, drawerMode);
    },
    [openDrawer]
  );

  const openTemplate = useCallback(
    (templateId: string) => {
      openDrawer('template', templateId, 'view');
    },
    [openDrawer]
  );

  const openCreateProject = useCallback(() => {
    openDrawer('project', null, 'create');
  }, [openDrawer]);

  return {
    isOpen,
    entityId,
    entityType,
    mode,
    openDrawer,
    closeDrawer,
    reset,
    openProject,
    openTemplate,
    openCreateProject,
    getDrawerTitle,
    formatDrawerSubtitle
  };
}
