export type FeatureFlagGroup = 'projects' | 'finance' | 'platform';

export type FeatureFlagDefinition = {
  name:
    | 'projectsCore'
    | 'financeGlobal'
    | 'projectsOverview'
    | 'projectCreateWizard'
    | 'projectDashboard'
    | 'tasksWorkspace'
    | 'budgetLimits'
    | 'financeAutomations';
  env: string;
  label: string;
  description: string;
  defaultValue: boolean;
  group: FeatureFlagGroup;
  public: boolean;
};

export const FEATURE_FLAG_DEFINITIONS = [
  {
    name: 'projectsCore',
    env: 'FEATURE_PROJECTS_V1',
    label: 'Проекты v1 (ядро)',
    description: 'Включает API и интерфейсы CRM проектов: дашборд, задачи, workflow, шаблоны.',
    defaultValue: true,
    group: 'projects',
    public: false
  },
  {
    name: 'financeGlobal',
    env: 'NEXT_PUBLIC_FEATURE_FINANCE_GLOBAL',
    label: 'Финансы → Расходы (глобальный раздел)',
    description: 'Отображает глобальный журнал расходов и связанные адаптеры.',
    defaultValue: true,
    group: 'finance',
    public: true
  },
  {
    name: 'projectsOverview',
    env: 'NEXT_PUBLIC_FEATURE_PROJECTS_OVERVIEW',
    label: 'Обзор проектов (hub)',
    description: 'Включает новый hub /app/projects со списками, фильтрами и состояниями.',
    defaultValue: true,
    group: 'projects',
    public: true
  },
  {
    name: 'projectCreateWizard',
    env: 'NEXT_PUBLIC_FEATURE_CREATE_WIZARD',
    label: 'Мастер создания проекта',
    description: 'Показывает трёхшаговый мастер создания и подключает drawer.',
    defaultValue: false,
    group: 'projects',
    public: true
  },
  {
    name: 'projectDashboard',
    env: 'NEXT_PUBLIC_FEATURE_PROJECT_DASHBOARD',
    label: 'Дашборд проекта',
    description: 'Активирует новый экран дашборда и связанные виджеты в проекте.',
    defaultValue: false,
    group: 'projects',
    public: true
  },
  {
    name: 'tasksWorkspace',
    env: 'NEXT_PUBLIC_FEATURE_TASKS_WORKSPACE',
    label: 'Рабочее пространство проектов',
    description: 'Открывает объединённое рабочее пространство задач/бордов.',
    defaultValue: false,
    group: 'projects',
    public: true
  },
  {
    name: 'budgetLimits',
    env: 'NEXT_PUBLIC_FEATURE_BUDGET_LIMITS',
    label: 'Бюджет и лимиты проекта',
    description: 'Включает настройки бюджета, пересчёт лимитов и связанные баннеры.',
    defaultValue: false,
    group: 'finance',
    public: true
  },
  {
    name: 'financeAutomations',
    env: 'NEXT_PUBLIC_FEATURE_FINANCE_AUTOMATIONS',
    label: 'Автоматизации финансов',
    description: 'Показывает правила автоматизации и кнопки быстрого создания расходов.',
    defaultValue: false,
    group: 'finance',
    public: true
  }
] as const satisfies readonly FeatureFlagDefinition[];

export type FeatureFlagName = (typeof FEATURE_FLAG_DEFINITIONS)[number]['name'];

export const FEATURE_FLAG_BY_NAME: Record<FeatureFlagName, FeatureFlagDefinition> = FEATURE_FLAG_DEFINITIONS.reduce(
  (acc, definition) => {
    acc[definition.name] = definition;
    return acc;
  },
  {} as Record<FeatureFlagName, FeatureFlagDefinition>
);
