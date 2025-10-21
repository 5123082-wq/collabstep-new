import { create } from 'zustand';
import type { ProjectStage } from '@/domain/projects/types';

export type CatalogTab = 'my' | 'templates' | 'archive';

export type CatalogProject = {
  id: string;
  title: string;
  stage: ProjectStage | null;
  updatedAt: string;
  tasksCount: number;
  labels: string[];
  archived: boolean;
};

export type CatalogTemplate = {
  id: string;
  title: string;
  kind: string;
  summary: string;
};

type AttachModalState = {
  open: boolean;
  template: CatalogTemplate | null;
  projectId: string;
  projectOptions: CatalogProject[];
  isSubmitting: boolean;
  error: string | null;
};

type ProjectCatalogState = {
  activeTab: CatalogTab;
  setActiveTab: (tab: CatalogTab) => void;
  message: string | null;
  setMessage: (message: string | null) => void;
  attachModal: AttachModalState;
  openAttachModal: (options: {
    template: CatalogTemplate;
    projectId: string;
    projectOptions: CatalogProject[];
  }) => void;
  closeAttachModal: () => void;
  updateAttachModal: (patch: Partial<Omit<AttachModalState, 'open'>>) => void;
  reset: () => void;
};

const createDefaultAttachModal = (): AttachModalState => ({
  open: false,
  template: null,
  projectId: '',
  projectOptions: [],
  isSubmitting: false,
  error: null
});

const defaultState = {
  activeTab: 'my' as CatalogTab,
  message: null as string | null,
  attachModal: createDefaultAttachModal()
};

export const useProjectCatalogStore = create<ProjectCatalogState>((set) => ({
  ...defaultState,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setMessage: (message) => set({ message }),
  openAttachModal: ({ template, projectId, projectOptions }) =>
    set({
      attachModal: {
        open: true,
        template,
        projectId,
        projectOptions,
        isSubmitting: false,
        error: null
      }
    }),
  closeAttachModal: () => set({ attachModal: createDefaultAttachModal() }),
  updateAttachModal: (patch) =>
    set((state) =>
      state.attachModal.open
        ? {
            attachModal: {
              ...state.attachModal,
              ...patch,
              open: true
            }
          }
        : state
    ),
  reset: () =>
    set({
      ...defaultState,
      attachModal: createDefaultAttachModal()
    })
}));
