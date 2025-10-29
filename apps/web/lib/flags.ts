import { isFeatureEnabled } from '@/lib/feature-flags';

function resolveLegacyBooleanFlag(keys: string[], fallback = false): boolean {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
      }
      if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
      }
      return fallback;
    }
  }

  return fallback;
}

export const flags = {
  PROJECTS_V1: isFeatureEnabled('projectsCore'),
  PROJECTS_VIEWS: isFeatureEnabled('projectsOverview'),
  AI_V1: resolveLegacyBooleanFlag(['NEXT_PUBLIC_FEATURE_AI_V1', 'FEATURE_AI_V1']),
  MARKETPLACE_ATTACH: resolveLegacyBooleanFlag(['NEXT_PUBLIC_FEATURE_MARKETPLACE_ATTACH', 'FEATURE_MARKETPLACE_ATTACH']),
  PROJECTS_OVERVIEW: isFeatureEnabled('projectsOverview'),
  PROJECT_CREATE_WIZARD: isFeatureEnabled('projectCreateWizard'),
  PROJECT_DASHBOARD: isFeatureEnabled('projectDashboard'),
  TASKS_WORKSPACE: isFeatureEnabled('tasksWorkspace'),
  BUDGET_LIMITS: isFeatureEnabled('budgetLimits'),
  FINANCE_AUTOMATIONS: isFeatureEnabled('financeAutomations'),
  FINANCE_GLOBAL: isFeatureEnabled('financeGlobal'),
  PROJECT_ATTACHMENTS: resolveLegacyBooleanFlag([
    'NEXT_PUBLIC_FEATURE_PROJECT_ATTACHMENTS',
    'FEATURE_PROJECT_ATTACHMENTS'
  ])
} as const;

export type FlagName = keyof typeof flags;
