'use client';

import { useMemo } from 'react';
import { defaultRailConfig } from '@/mocks/rail';
import type { QuickAction } from '@/types/quickActions';
import { isFeatureEnabled } from '@/lib/utils';
import { useUI } from '@/stores/ui';

type UseRailConfigOptions = {
  permissions?: string[];
  featureFlags?: Record<string, boolean>;
};

export type QuickActionWithBadge = QuickAction & { badge?: number };

export function useRailConfig(options: UseRailConfigOptions = {}) {
  const { permissions = [], featureFlags } = options;
  const unreadChats = useUI((state) => state.unreadChats);
  const unreadNotifications = useUI((state) => state.unreadNotifications);

  return useMemo<QuickActionWithBadge[]>(() => {
    const permissionSet = new Set(permissions);
    return defaultRailConfig
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
  }, [featureFlags, permissions, unreadChats, unreadNotifications]);
}
