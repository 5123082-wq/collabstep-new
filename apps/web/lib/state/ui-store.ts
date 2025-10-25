import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

export type WallpaperPreset =
  | 'mesh'
  | 'grid'
  | 'halo'
  | 'sunrise'
  | 'mint'
  | 'lavender'
  | 'sands';

type UiState = {
  bgPreset: WallpaperPreset;
  expandedGroups: string[];
  lastProjectId: string | null;
  isSidebarCollapsed: boolean;
  setBgPreset: (v: UiState['bgPreset']) => void;
  toggleGroup: (id: string) => void;
  setExpandedGroups: (ids: string[]) => void;
  setLastProjectId: (id: string | null) => void;
  setSidebarCollapsed: (value: boolean) => void;
  toggleSidebarCollapsed: () => void;
};

const memoryStore: Record<string, string> = {};

const memoryStorage: StateStorage = {
  getItem: (name: string) =>
    Object.prototype.hasOwnProperty.call(memoryStore, name) ? memoryStore[name]! : null,
  setItem: (name: string, value: string) => {
    memoryStore[name] = value;
  },
  removeItem: (name: string) => {
    delete memoryStore[name];
  }
};

const defaultState: Pick<UiState, 'bgPreset' | 'expandedGroups' | 'lastProjectId' | 'isSidebarCollapsed'> = {
  bgPreset: 'mesh',
  expandedGroups: [],
  lastProjectId: null,
  isSidebarCollapsed: false
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
      setLastProjectId: (id) => set({ lastProjectId: id }),
      setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
      toggleSidebarCollapsed: () => set({ isSidebarCollapsed: !get().isSidebarCollapsed })
    }),
    {
      name: 'cv-ui',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : (window.localStorage as unknown as StateStorage)
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<UiState>) ?? {};

        const allowedPresets: WallpaperPreset[] = ['mesh', 'grid', 'halo', 'sunrise', 'mint', 'lavender', 'sands'];
        const bgPreset = allowedPresets.includes(persisted.bgPreset as WallpaperPreset)
          ? (persisted.bgPreset as WallpaperPreset)
          : currentState.bgPreset;

        const expandedGroups = Array.isArray(persisted.expandedGroups)
          ? persisted.expandedGroups.filter((item): item is string => typeof item === 'string')
          : currentState.expandedGroups;

        const lastProjectId = typeof persisted.lastProjectId === 'string' ? persisted.lastProjectId : null;

        const isSidebarCollapsed = typeof persisted.isSidebarCollapsed === 'boolean'
          ? persisted.isSidebarCollapsed
          : currentState.isSidebarCollapsed;

        return {
          ...currentState,
          ...persisted,
          bgPreset,
          expandedGroups,
          lastProjectId,
          isSidebarCollapsed
        } satisfies UiState;
      }
    }
  )
);
