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
      workflowId: 'wf-proj-admin-landing-archive',
      archived: true,
      createdAt: '2023-11-05T10:00:00.000Z',
      updatedAt: '2024-01-20T17:45:00.000Z'
    }
  ] as Project[],
  TASKS: [
    {
      id: 'task-admin-epic-foundation',
      projectId: 'proj-admin-onboarding',
      title: 'Эпик: Старт команды',
      description: 'Подготовить инфраструктуру и рабочие ритуалы для команды запуска.',
      status: 'in_progress',
      assigneeId: DEFAULT_WORKSPACE_USER_ID,
      labels: ['Стратегия'],
      kind: 'epic',
      order: 1,
      estimateMinutes: 40 * 60,
      spentMinutes: 22 * 60,
      checklist: [
        { id: 'task-admin-epic-foundation-check-brief', title: 'Утвердить цели спринта', done: true },
        { id: 'task-admin-epic-foundation-check-rituals', title: 'Назначить фасилитаторов ритуалов', done: false }
      ],
      createdAt: '2024-05-01T09:00:00.000Z',
      updatedAt: '2024-06-12T10:15:00.000Z'
    },
    {
      id: 'task-admin-brief',
      projectId: 'proj-admin-onboarding',
      parentId: 'task-admin-epic-foundation',
      title: 'Подготовить бриф и дорожную карту',
      description: 'Сформировать цели, KPI и ритуалы команды.',
      status: 'in_progress',
      assigneeId: DEFAULT_WORKSPACE_USER_ID,
      labels: ['Стратегия', 'Команда'],
      kind: 'task',
      order: 2,
      estimateMinutes: 16 * 60,
      spentMinutes: 12 * 60,
      checklist: [
        { id: 'task-admin-brief-check-goals', title: 'Собрать входящие ожидания', done: true },
        { id: 'task-admin-brief-check-risks', title: 'Зафиксировать ключевые риски', done: false }
      ],
      createdAt: '2024-05-02T09:00:00.000Z',
      updatedAt: '2024-06-08T14:20:00.000Z'
    },
    {
      id: 'task-admin-brief-research',
      projectId: 'proj-admin-onboarding',
      parentId: 'task-admin-brief',
      title: 'Исследовать процессы команд',
      description: 'Провести интервью с ключевыми стейкхолдерами и собрать боли.',
      status: 'review',
      assigneeId: 'researcher-1',
      labels: ['Research'],
      kind: 'subtask',
      order: 3,
      estimateMinutes: 8 * 60,
      spentMinutes: 6 * 60,
      checklist: [
        { id: 'task-admin-brief-research-check-plan', title: 'Подготовить гайд интервью', done: true },
        { id: 'task-admin-brief-research-check-sync', title: 'Согласовать выводы с командой', done: false }
      ],
      createdAt: '2024-05-04T11:30:00.000Z',
      updatedAt: '2024-06-07T08:45:00.000Z'
    },
    {
      id: 'task-admin-brief-rituals',
      projectId: 'proj-admin-onboarding',
      parentId: 'task-admin-brief',
      title: 'Настроить командные ритуалы',
      description: 'Внедрить еженедельные ретро и синки с понятной повесткой.',
      status: 'new',
      assigneeId: 'facilitator-1',
      labels: ['Команда'],
      kind: 'subtask',
      order: 4,
      estimateMinutes: 4 * 60,
      checklist: [
        { id: 'task-admin-brief-rituals-check-cadence', title: 'Определить расписание', done: false },
        { id: 'task-admin-brief-rituals-check-tools', title: 'Подобрать инструменты', done: false }
      ],
      createdAt: '2024-05-05T09:45:00.000Z',
      updatedAt: '2024-06-01T07:30:00.000Z'
    },
    {
      id: 'task-admin-epic-experience',
      projectId: 'proj-admin-onboarding',
      title: 'Эпик: Опыт новичков',
      description: 'Продумать визуальный язык и впечатление от первых дней.',
      status: 'review',
      assigneeId: 'designer-1',
      labels: ['Дизайн'],
      kind: 'epic',
      order: 5,
      estimateMinutes: 24 * 60,
      spentMinutes: 10 * 60,
      checklist: [
        { id: 'task-admin-epic-experience-check-brief', title: 'Собрать бриф по тону коммуникаций', done: true },
        { id: 'task-admin-epic-experience-check-assets', title: 'Подготовить шаблоны приветствий', done: false }
      ],
      createdAt: '2024-05-10T11:00:00.000Z',
      updatedAt: '2024-06-09T10:30:00.000Z'
    },
    {
      id: 'task-admin-design',
      projectId: 'proj-admin-onboarding',
      parentId: 'task-admin-epic-experience',
      title: 'Собрать дизайн-концепты',
      description: 'Подготовить варианты визуального языка продукта.',
      status: 'review',
      assigneeId: 'designer-1',
      labels: ['Дизайн'],
      kind: 'task',
      order: 6,
      estimateMinutes: 12 * 60,
      spentMinutes: 8 * 60,
      checklist: [
        { id: 'task-admin-design-check-moodboard', title: 'Собрать мудборд', done: true },
        { id: 'task-admin-design-check-feedback', title: 'Провести сессию фидбэка', done: false }
      ],
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
