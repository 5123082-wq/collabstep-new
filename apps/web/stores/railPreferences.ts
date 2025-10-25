import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';
import { defaultRailConfig } from '@/mocks/rail';
import type { RailIconId } from '@/config/railIcons';
import { isValidRailIconId } from '@/config/railIcons';
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

export type PersistedCustomRailAction = {
  id: string;
  label: string;
  icon: RailIconId;
  intent: RailIntent;
  payload?: Record<string, unknown>;
  section?: string;
};

export type CreateCustomRailActionInput = Omit<PersistedCustomRailAction, 'id'>;

type RailPreferencesState = {
  enabledActionIds: string[];
  customActions: PersistedCustomRailAction[];
  toggleAction: (id: string) => void;
  moveAction: (id: string, direction: MoveDirection) => void;
  reset: () => void;
  setEnabledActionIds: (ids: string[]) => void;
  addCustomAction: (action: CreateCustomRailActionInput) => void;
  removeCustomAction: (id: string) => void;
};

const VALID_INTENTS: RailIntent[] = ['route', 'sheet', 'dialog', 'command'];

function createCustomId() {
  return `custom-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function sanitizeIds(ids: unknown, customActions: PersistedCustomRailAction[]): string[] {
  if (!Array.isArray(ids)) {
    return [...DEFAULT_ACTION_IDS];
  }
  const availableIds = new Set<string>([
    ...DEFAULT_ACTION_IDS,
    ...customActions.map((action) => action.id)
  ]);
  const seen = new Set<string>();
  const sanitized: string[] = [];
  for (const candidate of ids) {
    if (typeof candidate !== 'string') {
      continue;
    }
    if (!availableIds.has(candidate)) {
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

function sanitizeCustomActions(actions: unknown): PersistedCustomRailAction[] {
  if (!Array.isArray(actions)) {
    return [];
  }
  const sanitized: PersistedCustomRailAction[] = [];
  for (const entry of actions) {
    if (typeof entry !== 'object' || entry === null) {
      continue;
    }
    const id = typeof (entry as { id?: unknown }).id === 'string' ? (entry as { id: string }).id : null;
    const labelValue = typeof (entry as { label?: unknown }).label === 'string' ? (entry as { label: string }).label : null;
    const label = labelValue?.trim();
    const icon = (entry as { icon?: unknown }).icon;
    const intent = (entry as { intent?: unknown }).intent;
    const payload = (entry as { payload?: unknown }).payload;
    const section = (entry as { section?: unknown }).section;
    if (!id || !label || typeof intent !== 'string' || !VALID_INTENTS.includes(intent as RailIntent)) {
      continue;
    }
    const nextIcon: RailIconId = isValidRailIconId(icon) ? icon : 'plusCircle';
    const sanitizedPayload =
      typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : undefined;
    const sanitizedSection = typeof section === 'string' && section.trim() !== '' ? section : 'custom';
    const next: PersistedCustomRailAction = {
      id,
      label,
      icon: nextIcon,
      intent: intent as RailIntent,
      section: sanitizedSection
    };
    if (sanitizedPayload) {
      next.payload = sanitizedPayload;
    }
    sanitized.push(next);
  }
  return sanitized;
}

export const useRailPreferencesStore = create<RailPreferencesState>()(
  persist(
    (set) => ({
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
      reset: () =>
        set({
          enabledActionIds: [...DEFAULT_ACTION_IDS],
          customActions: []
        }),
      setEnabledActionIds: (ids) =>
        set((state) => ({ enabledActionIds: sanitizeIds(ids, state.customActions) })),
      addCustomAction: (action) => {
        set((state) => {
          const id = createCustomId();
          const payload =
            typeof action.payload === 'object' && action.payload !== null
              ? (action.payload as Record<string, unknown>)
              : undefined;
          const nextAction: PersistedCustomRailAction = {
            id,
            label: action.label,
            icon: isValidRailIconId(action.icon) ? action.icon : 'plusCircle',
            intent: VALID_INTENTS.includes(action.intent) ? action.intent : 'command',
            section: action.section ?? 'custom'
          };
          if (payload) {
            nextAction.payload = payload;
          }
          return {
            customActions: [...state.customActions, nextAction],
            enabledActionIds: [...state.enabledActionIds, id]
          };
        });
      },
      removeCustomAction: (id) => {
        set((state) => {
          const nextCustom = state.customActions.filter((action) => action.id !== id);
          const nextEnabled = state.enabledActionIds.filter((item) => item !== id);
          return {
            customActions: nextCustom,
            enabledActionIds: nextEnabled.length > 0 ? nextEnabled : [...DEFAULT_ACTION_IDS]
          };
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
        const customActions = sanitizeCustomActions(persisted.customActions);
        const enabledActionIds = sanitizeIds(persisted.enabledActionIds, customActions);
        return {
          ...currentState,
          enabledActionIds,
          customActions
        } satisfies RailPreferencesState;
      }
    }
  )
);

