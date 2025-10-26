import { create } from 'zustand';

export type DrawerMode = 'view' | 'edit' | 'create' | string;

type ProjectDrawerState = {
  isOpen: boolean;
  entityType: string | null;
  entityId: string | null;
  mode: DrawerMode | null;
  openDrawer: (entityType: string, entityId?: string | null, mode?: DrawerMode | null) => void;
  closeDrawer: () => void;
  reset: () => void;
};

const initialState = {
  isOpen: false,
  entityType: null,
  entityId: null,
  mode: null
} as const;

export const useProjectDrawerStore = create<ProjectDrawerState>((set) => ({
  ...initialState,
  openDrawer: (entityType, entityId = null, mode = null) =>
    set({ isOpen: true, entityType, entityId, mode }),
  closeDrawer: () => set({ ...initialState }),
  reset: () => set({ ...initialState })
}));

export function getDrawerTitle(entityType: string | null): string {
  if (!entityType) {
    return 'Карточка';
  }
  if (entityType === 'template') {
    return 'Карточка шаблона';
  }
  if (entityType === 'workspace') {
    return 'Карточка рабочего пространства';
  }
  return 'Карточка проекта';
}

export function formatDrawerSubtitle(entityId: string | null, mode: DrawerMode | null): string | null {
  if (!entityId && !mode) {
    return null;
  }
  if (entityId && mode) {
    return `${entityId} · режим: ${mode}`;
  }
  if (entityId) {
    return entityId;
  }
  if (mode) {
    return `Режим: ${mode}`;
  }
  return null;
}

export function createEscapeKeyHandler(onClose: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };
}

export type { ProjectDrawerState };
