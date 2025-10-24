export type FeatureFlagKey =
  | 'projectsCore'
  | 'financeGlobal'
  | 'projectsOverview'
  | 'projectCreateWizard'
  | 'projectDashboard'
  | 'budgetLimits'
  | 'tasksWorkspace'
  | 'financeAutomations';

export type FeatureFlagDefinition = {
  env: string;
  stage: number;
  description: string;
  default: boolean;
};

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'on', 'enabled']);
const FALSY_VALUES = new Set(['0', 'false', 'no', 'off', 'disabled']);

export const featureFlagRegistry = {
  projectsCore: {
    env: 'FEATURE_PROJECTS_V1',
    stage: 0,
    description: 'Ядро CRM проектов и совместимость с легаси-маршрутами.',
    default: true
  },
  financeGlobal: {
    env: 'NEXT_PUBLIC_FEATURE_FINANCE_GLOBAL',
    stage: 1,
    description: 'Глобальный раздел «Финансы → Расходы».',
    default: true
  },
  projectsOverview: {
    env: 'NEXT_PUBLIC_FEATURE_PROJECTS_OVERVIEW',
    stage: 2,
    description: 'Новый обзор проектов /app/projects.',
    default: true
  },
  projectCreateWizard: {
    env: 'NEXT_PUBLIC_FEATURE_CREATE_WIZARD',
    stage: 3,
    description: 'Мастер создания проекта из трёх шагов.',
    default: false
  },
  projectDashboard: {
    env: 'NEXT_PUBLIC_FEATURE_PROJECT_DASHBOARD',
    stage: 4,
    description: 'Дашборд проекта с виджетами прогресса и рисков.',
    default: false
  },
  budgetLimits: {
    env: 'NEXT_PUBLIC_FEATURE_BUDGET_LIMITS',
    stage: 5,
    description: 'Управление бюджетом, лимитами и предупреждениями.',
    default: false
  },
  tasksWorkspace: {
    env: 'NEXT_PUBLIC_FEATURE_TASKS_WORKSPACE',
    stage: 6,
    description: 'Рабочее пространство задач (список и канбан).',
    default: false
  },
  financeAutomations: {
    env: 'NEXT_PUBLIC_FEATURE_FINANCE_AUTOMATIONS',
    stage: 8,
    description: 'Автоматизации финансов и журнал срабатываний.',
    default: false
  }
} as const satisfies Record<FeatureFlagKey, FeatureFlagDefinition>;

export type FeatureFlagRegistry = typeof featureFlagRegistry;

export const featureFlagEntries = Object.freeze(
  Object.entries(featureFlagRegistry) as [FeatureFlagKey, FeatureFlagDefinition][]
);

export function resolveFlagValue(
  rawValue: string | undefined,
  fallback: boolean
): boolean {
  if (rawValue === undefined) {
    return fallback;
  }

  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (TRUTHY_VALUES.has(normalized)) {
    return true;
  }

  if (FALSY_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}

export function getFeatureFlagSnapshot(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): Record<FeatureFlagKey, boolean> {
  return featureFlagEntries.reduce<Record<FeatureFlagKey, boolean>>((acc, [key, definition]) => {
    acc[key] = resolveFlagValue(env?.[definition.env], definition.default);
    return acc;
  }, {} as Record<FeatureFlagKey, boolean>);
}

export function isFeatureEnabled(
  flag: FeatureFlagKey,
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): boolean {
  const definition = featureFlagRegistry[flag];
  return resolveFlagValue(env?.[definition.env], definition.default);
}
