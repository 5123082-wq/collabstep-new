import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { defaultRailConfig } from '@/mocks/rail';
import type { RailIconId } from '@/lib/railIcons';
import type { RailIntent } from '@/types/quickActions';

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
type CustomActionIntent = Extract<RailIntent, 'route' | 'command'>;

type SerializableCustomAction = {
  id: string;
  label: string;
  icon: RailIconId;
  intent: CustomActionIntent;
  payload?: Record<string, unknown>;
  section?: string;
};

type CustomActionInput = Omit<SerializableCustomAction, 'id'> & { id?: string };

type RailPreferencesState = {
  enabledActionIds: string[];
  customActions: SerializableCustomAction[];
  toggleAction: (id: string) => void;
  moveAction: (id: string, direction: MoveDirection) => void;
  reset: () => void;
  setEnabledActionIds: (ids: string[]) => void;
  addCustomAction: (action: CustomActionInput) => void;
  removeCustomAction: (id: string) => void;
};

function sanitizeIds(ids: unknown, allowedIds: string[], fallbackOrder: string[]): string[] {
  if (!Array.isArray(ids)) {
    return [...fallbackOrder];
  }
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const candidate of ids) {
    if (typeof candidate !== 'string') {
      continue;
    }
    if (!allowedIds.includes(candidate)) {
      continue;
    }
    if (seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    sanitized.push(candidate);
  }
  if (sanitized.length === 0) {
    return [...fallbackOrder];
  }
  const missing = fallbackOrder.filter((id) => allowedIds.includes(id) && !seen.has(id));
  return [...sanitized, ...missing];
}

function sanitizeCustomActions(actions: unknown): SerializableCustomAction[] {
  if (!Array.isArray(actions)) {
    return [];
  }
  const sanitized: SerializableCustomAction[] = [];
  for (const candidate of actions) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }
    const { id, label, icon, intent, payload, section } = candidate as Partial<SerializableCustomAction>;
    if (typeof id !== 'string' || typeof label !== 'string' || typeof icon !== 'string') {
      continue;
    }
    if (intent !== 'route' && intent !== 'command') {
      continue;
    }
    const normalizedPayload = typeof payload === 'object' && payload !== null ? payload : undefined;
    const normalizedSection = typeof section === 'string' ? section : undefined;
    const entry: SerializableCustomAction = {
      id,
      label,
      icon: icon as RailIconId,
      intent
    };
    if (normalizedPayload) {
      entry.payload = normalizedPayload;
    }
    if (normalizedSection) {
      entry.section = normalizedSection;
    }
    sanitized.push(entry);
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
      reset: () => set({ enabledActionIds: [...DEFAULT_ACTION_IDS], customActions: [] }),
      setEnabledActionIds: (ids) => {
        const state = get();
        const customIds = state.customActions.map((action) => action.id);
        const allowed = [...DEFAULT_ACTION_IDS, ...customIds];
        const fallback = [...DEFAULT_ACTION_IDS, ...customIds];
        set({ enabledActionIds: sanitizeIds(ids, allowed, fallback) });
      },
      addCustomAction: (action) => {
        set((state) => {
          const baseId = action.id && action.id.trim().length > 0 ? action.id.trim() : `custom-${Date.now()}`;
          const takenIds = new Set([...state.enabledActionIds, ...state.customActions.map((item) => item.id)]);
          let uniqueId = baseId;
          let counter = 0;
          while (takenIds.has(uniqueId)) {
            counter += 1;
            uniqueId = `${baseId}-${counter}`;
          }
          const newAction: SerializableCustomAction = {
            id: uniqueId,
            label: action.label,
            icon: action.icon,
            intent: action.intent,
            section: action.section ?? 'custom'
          };
          if (action.payload) {
            newAction.payload = action.payload;
          }
          return {
            customActions: [...state.customActions, newAction],
            enabledActionIds: [...state.enabledActionIds, newAction.id]
          };
        });
      },
      removeCustomAction: (id) => {
        set((state) => ({
          customActions: state.customActions.filter((action) => action.id !== id),
          enabledActionIds: state.enabledActionIds.filter((actionId) => actionId !== id)
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
        const persistedCustomActions = sanitizeCustomActions(persisted.customActions);
        const customIds = persistedCustomActions.map((action) => action.id);
        const allowed = [...DEFAULT_ACTION_IDS, ...customIds];
        const fallback = [...DEFAULT_ACTION_IDS, ...customIds];
        const enabledActionIds = sanitizeIds(persisted.enabledActionIds, allowed, fallback);
        return {
          ...currentState,
          ...persisted,
          enabledActionIds,
          customActions: persistedCustomActions
        } satisfies RailPreferencesState;
      }
    }
  )
);

