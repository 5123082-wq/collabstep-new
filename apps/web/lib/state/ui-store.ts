import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UiState = {
  bgPreset: 'mesh' | 'grid' | 'halo';
  expandedGroups: string[];
  lastProjectId: string | null;
  setBgPreset: (v: UiState['bgPreset']) => void;
  toggleGroup: (id: string) => void;
  setExpandedGroups: (ids: string[]) => void;
  setLastProjectId: (id: string | null) => void;
};

const memoryStore: Record<string, string> = {};

const memoryStorage = {
  getItem: (name: string) => (name in memoryStore ? memoryStore[name]! : null),
  setItem: (name: string, value: string) => {
    memoryStore[name] = value;
  },
  removeItem: (name: string) => {
    delete memoryStore[name];
  }
};

const defaultState: Pick<UiState, 'bgPreset' | 'expandedGroups' | 'lastProjectId'> = {
  bgPreset: 'mesh',
  expandedGroups: [],
  lastProjectId: null
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setBgPreset: (v) => set({ bgPreset: v }),
      toggleGroup: (id) => {
        const current = get().expandedGroups;
        const exists = current.includes(id);
        set({ expandedGroups: exists ? current.filter((item) => item !== id) : [...current, id] });
      },
      setExpandedGroups: (ids) => set({ expandedGroups: ids }),
      setLastProjectId: (id) => set({ lastProjectId: id })
    }),
    {
      name: 'cv-ui',
      storage: createJSONStorage(() => (typeof window === 'undefined' ? memoryStorage : window.localStorage)),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<UiState>) ?? {};

        const bgPreset =
          persisted.bgPreset === 'mesh' || persisted.bgPreset === 'grid' || persisted.bgPreset === 'halo'
            ? persisted.bgPreset
            : currentState.bgPreset;

        const expandedGroups = Array.isArray(persisted.expandedGroups)
          ? persisted.expandedGroups.filter((item): item is string => typeof item === 'string')
          : currentState.expandedGroups;

        const lastProjectId = typeof persisted.lastProjectId === 'string' ? persisted.lastProjectId : null;

        return {
          ...currentState,
          ...persisted,
          bgPreset,
          expandedGroups,
          lastProjectId
        } satisfies UiState;
      }
    }
  )
);
