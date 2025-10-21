import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { defaultRailConfig } from '@/mocks/rail';

const memoryStore: Record<string, string> = {};

const memoryStorage: StateStorage = {
  getItem: (name) => (name in memoryStore ? memoryStore[name]! : null),
  setItem: (name, value) => {
    memoryStore[name] = value;
  },
  removeItem: (name) => {
    delete memoryStore[name];
  }
};

const DEFAULT_ACTION_IDS = defaultRailConfig.map((action) => action.id);

type MoveDirection = 'up' | 'down';

type RailPreferencesState = {
  enabledActionIds: string[];
  toggleAction: (id: string) => void;
  moveAction: (id: string, direction: MoveDirection) => void;
  reset: () => void;
  setEnabledActionIds: (ids: string[]) => void;
};

function sanitizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) {
    return [...DEFAULT_ACTION_IDS];
  }
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const candidate of ids) {
    if (typeof candidate !== 'string') {
      continue;
    }
    if (!DEFAULT_ACTION_IDS.includes(candidate)) {
      continue;
    }
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    sanitized.push(candidate);
  }
  if (sanitized.length === 0) {
    return [...DEFAULT_ACTION_IDS];
  }
  const missing = DEFAULT_ACTION_IDS.filter((id) => !seen.has(id));
  return [...sanitized, ...missing];
}

export const useRailPreferencesStore = create<RailPreferencesState>()(
  persist(
    (set) => ({
      enabledActionIds: [...DEFAULT_ACTION_IDS],
      toggleAction: (id) => {
        set((state) => {
          const exists = state.enabledActionIds.includes(id);
          if (exists) {
            if (state.enabledActionIds.length <= 1) {
              return state;
            }
            return {
              enabledActionIds: state.enabledActionIds.filter((item) => item !== id)
            };
          }
          return {
            enabledActionIds: [...state.enabledActionIds, id]
          };
        });
      },
      moveAction: (id, direction) => {
        set((state) => {
          const index = state.enabledActionIds.indexOf(id);
          if (index === -1) {
            return state;
          }
          const next = [...state.enabledActionIds];
          if (direction === 'up' && index > 0) {
            const previousIndex = index - 1;
            const current = next[index];
            const previous = next[previousIndex];
            if (typeof current !== 'undefined' && typeof previous !== 'undefined') {
              next[previousIndex] = current;
              next[index] = previous;
            }
          }
          if (direction === 'down' && index < next.length - 1) {
            const nextIndex = index + 1;
            const current = next[index];
            const target = next[nextIndex];
            if (typeof current !== 'undefined' && typeof target !== 'undefined') {
              next[nextIndex] = current;
              next[index] = target;
            }
          }
          return { enabledActionIds: next };
        });
      },
      reset: () => set({ enabledActionIds: [...DEFAULT_ACTION_IDS] }),
      setEnabledActionIds: (ids) => set({ enabledActionIds: sanitizeIds(ids) })
    }),
    {
      name: 'cv-rail-preferences',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : (window.localStorage as unknown as StateStorage)
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<RailPreferencesState>) ?? {};
        const enabledActionIds = sanitizeIds(persisted.enabledActionIds);
        return {
          ...currentState,
          ...persisted,
          enabledActionIds
        } satisfies RailPreferencesState;
      }
    }
  )
);

