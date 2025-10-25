import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { defaultRailConfig } from '@/mocks/rail';
import {
  DEFAULT_CUSTOM_RAIL_ICON,
  isCustomRailIconKey,
  type CustomRailIconKey
} from '@/config/customRailIcons';

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

export type CustomRailAction = {
  id: string;
  label: string;
  url: string;
  icon: CustomRailIconKey;
};

type RailPreferencesState = {
  enabledActionIds: string[];
  customActions: CustomRailAction[];
  toggleAction: (id: string) => void;
  moveAction: (id: string, direction: MoveDirection) => void;
  reset: () => void;
  setEnabledActionIds: (ids: string[]) => void;
  addCustomAction: (input: Omit<CustomRailAction, 'id'>) => void;
  removeCustomAction: (id: string) => void;
};

function sanitizeIds(ids: unknown, availableIds: string[], fallbackIds: string[]): string[] {
  if (!Array.isArray(ids)) {
    return [...fallbackIds];
  }
  const availableSet = new Set(availableIds);
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const candidate of ids) {
    if (typeof candidate !== 'string') {
      continue;
    }
    if (!availableSet.has(candidate)) {
      continue;
    }
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    sanitized.push(candidate);
  }
  if (sanitized.length === 0) {
    return [...fallbackIds];
  }
  return sanitized;
}

function sanitizeCustomActions(actions: unknown): CustomRailAction[] {
  if (!Array.isArray(actions)) {
    return [];
  }
  const sanitized: CustomRailAction[] = [];
  const seen = new Set<string>();
  for (const candidate of actions) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }
    const id = typeof candidate.id === 'string' ? candidate.id : null;
    const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
    const url = typeof candidate.url === 'string' ? candidate.url.trim() : '';
    const icon = isCustomRailIconKey(candidate.icon) ? candidate.icon : DEFAULT_CUSTOM_RAIL_ICON;
    if (!id || !label || !url || seen.has(id)) {
      continue;
    }
    seen.add(id);
    sanitized.push({ id, label, url, icon });
  }
  return sanitized;
}

export const useRailPreferencesStore = create<RailPreferencesState>()(
  persist(
    (set, get) => ({
      enabledActionIds: [...DEFAULT_ACTION_IDS],
      customActions: [],
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
          const availableIds = new Set([
            ...DEFAULT_ACTION_IDS,
            ...state.customActions.map((action) => action.id)
          ]);
          if (!availableIds.has(id)) {
            return state;
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
      reset: () =>
        set({
          enabledActionIds: [...DEFAULT_ACTION_IDS],
          customActions: []
        }),
      setEnabledActionIds: (ids) => {
        const availableIds = [
          ...DEFAULT_ACTION_IDS,
          ...get().customActions.map((action) => action.id)
        ];
        set({ enabledActionIds: sanitizeIds(ids, availableIds, DEFAULT_ACTION_IDS) });
      },
      addCustomAction: (input) => {
        set((state) => {
          const label = input.label.trim();
          const url = input.url.trim();
          if (!label || !url) {
            return state;
          }
          const icon: CustomRailIconKey = isCustomRailIconKey(input.icon)
            ? input.icon
            : DEFAULT_CUSTOM_RAIL_ICON;
          const id = `custom-${nanoid(8)}`;
          if (state.customActions.some((action) => action.id === id)) {
            return state;
          }
          const nextAction: CustomRailAction = { id, label, url, icon };
          return {
            customActions: [...state.customActions, nextAction],
            enabledActionIds: [...state.enabledActionIds, id]
          };
        });
      },
      removeCustomAction: (id) => {
        set((state) => ({
          customActions: state.customActions.filter((action) => action.id !== id),
          enabledActionIds: state.enabledActionIds.filter((item) => item !== id)
        }));
      }
    }),
    {
      name: 'cv-rail-preferences',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : (window.localStorage as unknown as StateStorage)
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<RailPreferencesState>) ?? {};
        const customActions = sanitizeCustomActions(persisted.customActions);
        const availableIds = [...DEFAULT_ACTION_IDS, ...customActions.map((action) => action.id)];
        const enabledActionIds = sanitizeIds(
          persisted.enabledActionIds,
          availableIds,
          DEFAULT_ACTION_IDS
        );
        return {
          ...currentState,
          ...persisted,
          customActions,
          enabledActionIds
        } satisfies RailPreferencesState;
      }
    }
  )
);

