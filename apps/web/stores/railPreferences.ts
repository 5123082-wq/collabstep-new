import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { defaultRailConfig } from '@/mocks/rail';
import { DEFAULT_RAIL_ICON, railIconOptions } from '@/components/right-rail/railIcons';

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

export type MoveDirection = 'up' | 'down';

export type CustomRailAction = {
  id: string;
  label: string;
  url: string;
  iconName: string;
};

const DEFAULT_CUSTOM_LABEL = 'Новая кнопка';

function createCustomActionId(used: Set<string>): string {
  let candidate = '';
  do {
    candidate = `custom-${Math.random().toString(36).slice(2, 10)}`;
  } while (!candidate || used.has(candidate));
  return candidate;
}

function normalizeCustomAction(candidate: Partial<CustomRailAction> | null | undefined, used: Set<string>): CustomRailAction | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }
  let id = typeof candidate.id === 'string' ? candidate.id : '';
  if (!id || used.has(id)) {
    id = createCustomActionId(used);
  }
  used.add(id);
  const rawLabel = typeof candidate.label === 'string' ? candidate.label.trim() : '';
  const label = rawLabel.length > 0 ? rawLabel : DEFAULT_CUSTOM_LABEL;
  const rawUrl = typeof candidate.url === 'string' ? candidate.url.trim() : '';
  const url = rawUrl.length > 0 ? rawUrl : '/';
  const iconName = typeof candidate.iconName === 'string' ? candidate.iconName : DEFAULT_RAIL_ICON;
  const iconExists = railIconOptions.some((option) => option.value === iconName);
  return {
    id,
    label,
    url,
    iconName: iconExists ? iconName : DEFAULT_RAIL_ICON
  } satisfies CustomRailAction;
}

function sanitizeCustomActions(actions: unknown, used: Set<string>): CustomRailAction[] {
  if (!Array.isArray(actions)) {
    return [];
  }
  const sanitized: CustomRailAction[] = [];
  for (const item of actions) {
    const normalized = normalizeCustomAction(item as Partial<CustomRailAction>, used);
    if (normalized) {
      sanitized.push(normalized);
    }
  }
  return sanitized;
}

function sanitizeIds(ids: unknown, customActions: CustomRailAction[]): string[] {
  const available = new Set<string>([...DEFAULT_ACTION_IDS, ...customActions.map((action) => action.id)]);
  if (!Array.isArray(ids)) {
    return [...DEFAULT_ACTION_IDS];
  }
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const candidate of ids) {
    if (typeof candidate !== 'string') {
      continue;
    }
    if (!available.has(candidate)) {
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
  const missingDefaults = DEFAULT_ACTION_IDS.filter((id) => !seen.has(id));
  return [...sanitized, ...missingDefaults];
}

export type RailPreferencesState = {
  enabledActionIds: string[];
  customActions: CustomRailAction[];
  toggleAction: (id: string) => void;
  moveAction: (id: string, direction: MoveDirection) => void;
  reset: () => void;
  setEnabledActionIds: (ids: string[]) => void;
  addCustomAction: (input: { label: string; url: string; iconName: string }) => void;
  updateCustomAction: (id: string, input: Partial<Omit<CustomRailAction, 'id'>>) => void;
  removeCustomAction: (id: string) => void;
};

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
          const available = new Set<string>([
            ...DEFAULT_ACTION_IDS,
            ...state.customActions.map((action) => action.id)
          ]);
          if (!available.has(id)) {
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
        set((state) => ({
          enabledActionIds: [...DEFAULT_ACTION_IDS],
          customActions: state.customActions
        })),
      setEnabledActionIds: (ids) =>
        set((state) => ({
          enabledActionIds: sanitizeIds(ids, state.customActions)
        })),
      addCustomAction: (input) => {
        set((state) => {
          const used = new Set<string>([...DEFAULT_ACTION_IDS, ...state.customActions.map((action) => action.id)]);
          const id = createCustomActionId(used);
          const iconExists = railIconOptions.some((option) => option.value === input.iconName);
          const customAction: CustomRailAction = {
            id,
            label: input.label.trim().length > 0 ? input.label.trim() : DEFAULT_CUSTOM_LABEL,
            url: input.url.trim().length > 0 ? input.url.trim() : '/',
            iconName: iconExists ? input.iconName : DEFAULT_RAIL_ICON
          };
          const customActions = [...state.customActions, customAction];
          return {
            customActions,
            enabledActionIds: [...state.enabledActionIds, id]
          };
        });
      },
      updateCustomAction: (id, input) => {
        set((state) => {
          const customActions = state.customActions.map((action) => {
            if (action.id !== id) {
              return action;
            }
            const iconName =
              typeof input.iconName === 'string' && railIconOptions.some((option) => option.value === input.iconName)
                ? input.iconName
                : action.iconName;
            const label = typeof input.label === 'string' ? input.label : action.label;
            const url = typeof input.url === 'string' ? input.url : action.url;
            return {
              ...action,
              iconName,
              label: label.trim().length > 0 ? label.trim() : action.label,
              url: url.trim().length > 0 ? url.trim() : action.url
            } satisfies CustomRailAction;
          });
          return { customActions };
        });
      },
      removeCustomAction: (id) => {
        set((state) => {
          const customActions = state.customActions.filter((action) => action.id !== id);
          const enabledActionIds = state.enabledActionIds.filter((actionId) => actionId !== id);
          return { customActions, enabledActionIds };
        });
      }
    }),
    {
      name: 'cv-rail-preferences',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? memoryStorage : (window.localStorage as unknown as StateStorage)
      ),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<RailPreferencesState>) ?? {};
        const used = new Set<string>(DEFAULT_ACTION_IDS);
        const customActions = sanitizeCustomActions(persisted.customActions, used);
        const enabledActionIds = sanitizeIds(persisted.enabledActionIds, customActions);
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

