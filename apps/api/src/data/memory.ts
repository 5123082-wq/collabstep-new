import type {
  Account,
  AccountMember,
  AuditLogEntry,
  DomainEvent,
  Expense,
  ExpenseAttachment,
  Iteration,
  Project,
  ProjectBudget,
  ProjectBudgetSnapshot,
  ProjectMember,
  ProjectTemplate,
  ProjectType,
  ProjectVisibility,
  ProjectWorkflow,
  Task,
  Workspace,
  WorkspaceMember,
  WorkspaceUser
} from '../types';

export const DEFAULT_WORKSPACE_USER_ID = 'admin.demo@collabverse.test';
export const DEFAULT_ACCOUNT_ID = 'acct-collabverse';
export const DEFAULT_WORKSPACE_ID = 'ws-collabverse-core';

export const WORKSPACE_USERS: WorkspaceUser[] = [
  {
    id: DEFAULT_WORKSPACE_USER_ID,
    name: 'Алина Админ',
    email: 'admin.demo@collabverse.test',
    title: 'Руководитель продукта',
    department: 'Продукт',
    location: 'Москва'
  },
  {
    id: 'user.demo@collabverse.test',
    name: 'Игорь Участник',
    email: 'user.demo@collabverse.test',
    title: 'Менеджер проектов',
    department: 'Операции',
    location: 'Санкт-Петербург'
  },
  {
    id: 'finance.pm@collabverse.test',
    name: 'Мария Финансы',
    email: 'finance.pm@collabverse.test',
    title: 'Финансовый контролёр',
    department: 'Финансы',
    location: 'Москва'
  },
  {
    id: 'designer-1',
    name: 'Диана Дизайн',
    email: 'designer.demo@collabverse.test',
    title: 'Ведущий дизайнер',
    department: 'Дизайн',
    location: 'Екатеринбург'
  }
];

type GlobalMemoryScope = typeof globalThis & {
  __collabverseFinanceIdempotencyKeys__?: Map<string, string>;
};

const globalMemoryScope = globalThis as GlobalMemoryScope;
const globalIdempotencyKeys =
  globalMemoryScope.__collabverseFinanceIdempotencyKeys__ ?? new Map<string, string>();

globalMemoryScope.__collabverseFinanceIdempotencyKeys__ = globalIdempotencyKeys;

export const memory = {
  WORKSPACE_USERS,
  ACCOUNTS: [
    {
      id: DEFAULT_ACCOUNT_ID,
      name: 'Collabverse Demo Org',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      createdAt: '2024-01-10T08:00:00.000Z',
      updatedAt: '2024-06-01T10:00:00.000Z'
    }
  ] as Account[],
  ACCOUNT_MEMBERS: [
    { accountId: DEFAULT_ACCOUNT_ID, userId: DEFAULT_WORKSPACE_USER_ID, role: 'owner' },
    { accountId: DEFAULT_ACCOUNT_ID, userId: 'user.demo@collabverse.test', role: 'admin' },
    { accountId: DEFAULT_ACCOUNT_ID, userId: 'finance.pm@collabverse.test', role: 'member' },
    { accountId: DEFAULT_ACCOUNT_ID, userId: 'designer-1', role: 'viewer' }
  ] as AccountMember[],
  WORKSPACES: [
    {
      id: DEFAULT_WORKSPACE_ID,
      accountId: DEFAULT_ACCOUNT_ID,
      name: 'Core Product Team',
      description: 'Рабочее пространство основной продуктовой команды.',
      visibility: 'private' as ProjectVisibility,
      archived: false,
      createdAt: '2024-01-15T09:00:00.000Z',
      updatedAt: '2024-06-01T10:00:00.000Z'
    },
    {
      id: 'ws-marketing',
      accountId: DEFAULT_ACCOUNT_ID,
      name: 'Маркетинг и бренд',
      description: 'Команда продвижения, контента и событий.',
      visibility: 'public' as ProjectVisibility,
      archived: false,
      createdAt: '2024-02-01T09:00:00.000Z',
      updatedAt: '2024-05-25T11:00:00.000Z'
    }
  ] as Workspace[],
  WORKSPACE_MEMBERS: {
    [DEFAULT_WORKSPACE_ID]: [
      { workspaceId: DEFAULT_WORKSPACE_ID, userId: DEFAULT_WORKSPACE_USER_ID, role: 'owner' },
      { workspaceId: DEFAULT_WORKSPACE_ID, userId: 'user.demo@collabverse.test', role: 'admin' },
      { workspaceId: DEFAULT_WORKSPACE_ID, userId: 'finance.pm@collabverse.test', role: 'member' }
    ],
    'ws-marketing': [
      { workspaceId: 'ws-marketing', userId: DEFAULT_WORKSPACE_USER_ID, role: 'admin' },
      { workspaceId: 'ws-marketing', userId: 'designer-1', role: 'member' }
    ]
  } as Record<string, WorkspaceMember[]>,
  PROJECTS: [
    {
      id: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      title: 'Онбординг команды Collabstep',
      description: 'Первые шаги команды после запуска платформы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      stage: 'design',
      type: 'product' as ProjectType,
      visibility: 'private' as ProjectVisibility,
      budgetPlanned: 1200000,
      budgetSpent: 450000,
      workflowId: 'wf-proj-admin-onboarding',
      archived: false,
      createdAt: '2024-05-01T08:30:00.000Z',
      updatedAt: '2024-06-10T12:15:00.000Z'
    },
    {
      id: 'proj-admin-landing-archive',
      workspaceId: 'ws-marketing',
      title: 'Редизайн лендинга (архив)',
      description: 'Завершённая инициатива по обновлению главной страницы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      stage: 'launch',
      type: 'marketing' as ProjectType,
      visibility: 'public' as ProjectVisibility,
      budgetPlanned: 800000,
      budgetSpent: 820000,
      workflowId: 'wf-proj-admin-landing-archive',
      archived: true,
      createdAt: '2023-11-05T10:00:00.000Z',
      updatedAt: '2024-01-20T17:45:00.000Z'
    }
  ] as Project[],
  TASKS: [
    {
      id: 'task-admin-brief',
      projectId: 'proj-admin-onboarding',
      title: 'Подготовить бриф и дорожную карту',
      description: 'Сформировать цели, KPI и ритуалы команды.',
      status: 'in_progress',
      assigneeId: DEFAULT_WORKSPACE_USER_ID,
      labels: ['Стратегия', 'Команда'],
      createdAt: '2024-05-02T09:00:00.000Z',
      updatedAt: '2024-06-08T14:20:00.000Z'
    },
    {
      id: 'task-admin-design',
      projectId: 'proj-admin-onboarding',
      title: 'Собрать дизайн-концепты',
      description: 'Подготовить варианты визуального языка продукта.',
      status: 'review',
      assigneeId: 'designer-1',
      labels: ['Дизайн'],
      createdAt: '2024-05-12T11:00:00.000Z',
      updatedAt: '2024-06-09T10:30:00.000Z'
    }
  ] as Task[],
  WORKFLOWS: {
    'proj-admin-onboarding': {
      projectId: 'proj-admin-onboarding',
      statuses: ['new', 'in_progress', 'review', 'done']
    },
    'proj-admin-landing-archive': {
      projectId: 'proj-admin-landing-archive',
      statuses: ['new', 'in_progress', 'review', 'done']
    }
  } as Record<string, ProjectWorkflow>,
  ITERATIONS: [
    {
      id: 'iter-admin-onboarding-sprint-1',
      projectId: 'proj-admin-onboarding',
      title: 'Спринт 1: Запуск команды',
      start: '2024-05-06',
      end: '2024-05-17'
    }
  ] as Iteration[],
  TEMPLATES: [
    {
      id: 'tpl-admin-discovery',
      title: 'Админский discovery',
      kind: 'product',
      summary: 'Скрипты интервью, CJM и гипотезы для старта команды.'
    },
    { id: 'tpl-brand', title: 'Бренд-пакет', kind: 'brand', summary: 'Нейминг, айдентика, гайд' },
    { id: 'tpl-landing', title: 'Лендинг', kind: 'landing', summary: 'Одностраничник с формой' },
    { id: 'tpl-mkt', title: 'Маркетинг', kind: 'marketing', summary: 'Кампания + контент-план' },
    { id: 'tpl-product', title: 'Digital-продукт', kind: 'product', summary: 'MVP флоу + бэклог' }
  ] as ProjectTemplate[],
  PROJECT_MEMBERS: {
    'proj-admin-onboarding': [
      { userId: 'admin.demo@collabverse.test', role: 'owner' },
      { userId: 'user.demo@collabverse.test', role: 'member' }
    ],
    'proj-admin-landing-archive': [
      { userId: 'admin.demo@collabverse.test', role: 'owner' },
      { userId: 'finance.pm@collabverse.test', role: 'admin' },
      { userId: 'designer-1', role: 'viewer' }
    ]
  } as Record<string, ProjectMember[]>,
  EXPENSES: [] as Expense[],
  EXPENSE_ATTACHMENTS: [] as ExpenseAttachment[],
  PROJECT_BUDGETS: [] as (ProjectBudget | ProjectBudgetSnapshot)[],
  AUDIT_LOG: [] as AuditLogEntry[],
  EVENTS: [] as DomainEvent[],
  IDEMPOTENCY_KEYS: globalIdempotencyKeys
};

export function resetFinanceMemory(): void {
  memory.EXPENSES = [];
  memory.EXPENSE_ATTACHMENTS = [];
  memory.PROJECT_BUDGETS = [];
  memory.AUDIT_LOG = [];
  memory.EVENTS = [];
  const freshKeys = new Map<string, string>();
  memory.IDEMPOTENCY_KEYS = freshKeys;
  globalMemoryScope.__collabverseFinanceIdempotencyKeys__ = freshKeys;
}
