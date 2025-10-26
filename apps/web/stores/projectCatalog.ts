import { create } from 'zustand';
import type { ProjectCatalogItem } from '@/domain/projects/ProjectSectionAPI';

export type CatalogTab = 'my' | 'templates' | 'archive';

export type CatalogProject = ProjectCatalogItem;

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
  projects: CatalogProject[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  searchQuery: string;
  selectedProjectId: string | null;
  setProjects: (projects: CatalogProject[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  selectProject: (projectId: string | null) => void;
  setInitialized: (value: boolean) => void;
  upsertProject: (project: CatalogProject) => void;
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
  attachModal: createDefaultAttachModal(),
  projects: [] as CatalogProject[],
  loading: false,
  error: null as string | null,
  initialized: false,
  searchQuery: '',
  selectedProjectId: null as string | null
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
    }),
  setProjects: (projects) =>
    set((state) => ({
      projects: projects.slice(),
      selectedProjectId:
        state.selectedProjectId && projects.some((item) => item.id === state.selectedProjectId)
          ? state.selectedProjectId
          : projects[0]?.id ?? null
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectProject: (projectId) => set({ selectedProjectId: projectId }),
  setInitialized: (value) => set({ initialized: value }),
  upsertProject: (project) =>
    set((state) => {
      const exists = state.projects.some((item) => item.id === project.id);
      const projects = exists
        ? state.projects.map((item) => (item.id === project.id ? project : item))
        : [...state.projects, project];
      return {
        projects,
        selectedProjectId: exists ? state.selectedProjectId : project.id
      };
    })
}));

export type { ProjectCatalogState };
