import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

type ThemePreference = 'light' | 'dark' | 'system';
type BackgroundPreset = 'mesh' | 'grid' | 'halo' | 'bloom' | 'mist' | 'aurora' | 'midnight';

type UiState = {
  bgPreset: BackgroundPreset;
  expandedGroups: string[];
  lastProjectId: string | null;
  theme: ThemePreference;
  setBgPreset: (v: UiState['bgPreset']) => void;
  toggleGroup: (id: string) => void;
  setExpandedGroups: (ids: string[]) => void;
  setLastProjectId: (id: string | null) => void;
  setTheme: (theme: ThemePreference) => void;
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

const defaultState: Pick<UiState, 'bgPreset' | 'expandedGroups' | 'lastProjectId' | 'theme'> = {
  bgPreset: 'mesh',
  expandedGroups: [],
  lastProjectId: null,
  theme: 'system'
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setBgPreset: (v) => set({ bgPreset: v }),
      setTheme: (theme) => set({ theme }),
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
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : (window.localStorage as unknown as StateStorage)
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<UiState>) ?? {};

        const allowedPresets: BackgroundPreset[] = ['mesh', 'grid', 'halo', 'bloom', 'mist', 'aurora', 'midnight'];
        const persistedPreset = persisted.bgPreset as BackgroundPreset | undefined;
        const bgPreset = allowedPresets.includes(persistedPreset ?? 'mesh')
          ? (persistedPreset as BackgroundPreset)
          : currentState.bgPreset;

        const persistedTheme = persisted.theme as ThemePreference | undefined;
        const theme: ThemePreference = ['light', 'dark', 'system'].includes(persistedTheme ?? 'system')
          ? (persistedTheme as ThemePreference)
          : currentState.theme;

        const expandedGroups = Array.isArray(persisted.expandedGroups)
          ? persisted.expandedGroups.filter((item): item is string => typeof item === 'string')
          : currentState.expandedGroups;

        const lastProjectId = typeof persisted.lastProjectId === 'string' ? persisted.lastProjectId : null;

        return {
          ...currentState,
          ...persisted,
          bgPreset,
          theme,
          expandedGroups,
          lastProjectId
        } satisfies UiState;
      }
    }
  )
);
