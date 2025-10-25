'use client';

import { useMemo } from 'react';
import { defaultRailConfig } from '@/mocks/rail';
import type { QuickAction } from '@/types/quickActions';
import { isFeatureEnabled } from '@/lib/utils';
import { useUI } from '@/stores/ui';
import { useRailPreferencesStore, type CustomRailAction } from '@/stores/railPreferences';
import { getRailIconComponent } from '@/components/right-rail/railIcons';

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

  const customActionMap = useMemo(() => {
    return customActions.map((action) => convertCustomActionToQuickAction(action));
  }, [customActions]);

  return useMemo<QuickActionWithBadge[]>(() => {
    const permissionSet = new Set(permissions);
    const availableMap = new Map(
      [...defaultRailConfig, ...customActionMap].map((action) => [action.id, action])
    );

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
  }, [customActionMap, enabledActionIds, featureFlags, permissions, unreadChats, unreadNotifications]);
}

function convertCustomActionToQuickAction(action: CustomRailAction): QuickAction {
  const Icon = getRailIconComponent(action.iconName);
  return {
    id: action.id,
    label: action.label,
    icon: Icon,
    intent: 'route',
    payload: { to: action.url },
    section: 'custom'
  } satisfies QuickAction;
}
