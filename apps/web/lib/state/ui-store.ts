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
  getItem: (name: string) => (name in memoryStore ? memoryStore[name] : null),
  setItem: (name: string, value: string) => {
    memoryStore[name] = value;
  },
  removeItem: (name: string) => {
    delete memoryStore[name];
  }
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      bgPreset: 'mesh',
      expandedGroups: [],
      lastProjectId: null,
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
      storage: createJSONStorage(() => (typeof window === 'undefined' ? memoryStorage : window.localStorage))
    }
  )
);
