'use client';

import { useMemo } from 'react';
import { defaultRailConfig } from '@/mocks/rail';
import type { QuickAction } from '@/types/quickActions';
import { isFeatureEnabled } from '@/lib/utils';
import { resolveRailIcon } from '@/lib/railIcons';
import { useUI } from '@/stores/ui';
import { useRailPreferencesStore } from '@/stores/railPreferences';

type UseRailConfigOptions = {
  permissions?: string[];
  featureFlags?: Record<string, boolean>;
};

export type QuickActionWithBadge = QuickAction & { badge?: number };

export function useRailConfig(options: UseRailConfigOptions = {}) {
  const { permissions = [], featureFlags } = options;
  const unreadChats = useUI((state) => state.unreadChats);
  const unreadNotifications = useUI((state) => state.unreadNotifications);

  const enabledActionIds = useRailPreferencesStore((state) => state.enabledActionIds);
  const customActions = useRailPreferencesStore((state) => state.customActions);

  const availableActions = useMemo<QuickAction[]>(() => {
    const resolvedCustom = customActions.map<QuickAction>((action) => ({
      id: action.id,
      label: action.label,
      icon: resolveRailIcon(action.icon),
      intent: action.intent,
      section: action.section ?? 'custom',
      ...(action.payload ? { payload: action.payload } : {})
    }));
    return [...defaultRailConfig, ...resolvedCustom];
  }, [customActions]);

  return useMemo<QuickActionWithBadge[]>(() => {
    const permissionSet = new Set(permissions);
    const availableMap = new Map(availableActions.map((action) => [action.id, action]));

    const orderedActions = enabledActionIds
      .map((id) => availableMap.get(id))
      .filter((action): action is QuickAction => Boolean(action));

    return orderedActions
      .filter((action) => {
        if (action.permission && !permissionSet.has(action.permission)) {
          return false;
        }
        if (!isFeatureEnabled(action.featureFlag, featureFlags)) {
          return false;
        }
        return true;
      })
      .map((action) => {
        let badge = 0;
        if (action.badgeSelector) {
          const state = { ui: useUI.getState() };
          badge = Number(action.badgeSelector(state));
        } else if (action.id === 'chats') {
          badge = unreadChats;
        } else if (action.id === 'notifications') {
          badge = unreadNotifications;
        }
        const normalizedBadge = Number.isFinite(badge) && badge > 0 ? badge : 0;
        return { ...action, badge: normalizedBadge };
      });
  }, [availableActions, enabledActionIds, featureFlags, permissions, unreadChats, unreadNotifications]);
}
