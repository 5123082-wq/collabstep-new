import type {
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
  ProjectWorkflow,
  Task,
  WorkspaceUser
} from '../types';

export const DEFAULT_WORKSPACE_USER_ID = 'admin.demo@collabverse.test';

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
  PROJECTS: [
    {
      id: 'proj-admin-onboarding',
      title: 'Онбординг команды Collabstep',
      description: 'Первые шаги команды после запуска платформы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      stage: 'design',
      archived: false,
      createdAt: '2024-05-01T08:30:00.000Z',
      updatedAt: '2024-06-10T12:15:00.000Z'
    },
    {
      id: 'proj-admin-landing-archive',
      title: 'Редизайн лендинга (архив)',
      description: 'Завершённая инициатива по обновлению главной страницы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      stage: 'launch',
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
      { userId: 'finance.pm@collabverse.test', role: 'admin' }
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
