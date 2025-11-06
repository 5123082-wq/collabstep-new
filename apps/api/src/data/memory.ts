import type {
  Account,
  AccountMember,
  AuditLogEntry,
  DomainEvent,
  Expense,
  ExpenseAttachment,
  Iteration,
  Attachment,
  Document,
  DocumentVersion,
  FileObject,
  TaskComment,
  Project,
  ProjectBudget,
  ProjectBudgetSnapshot,
  ProjectMember,
  ProjectTemplate,
  ProjectStatus,
  ProjectType,
  ProjectVisibility,
  ProjectWorkflow,
  Task,
  TaskDependency,
  Workspace,
  WorkspaceMember,
  WorkspaceUser,
  PlatformModule,
  PlatformUserControl
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
  FILES: [
    {
      id: 'file-team-brief',
      uploaderId: DEFAULT_WORKSPACE_USER_ID,
      filename: 'Командный бриф.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 248_123,
      storageUrl: '/mock/files/team-brief.pdf',
      uploadedAt: '2024-05-04T09:00:00.000Z'
    },
    {
      id: 'file-design-assets',
      uploaderId: 'designer-1',
      filename: 'design-assets.zip',
      mimeType: 'application/zip',
      sizeBytes: 1_024_512,
      storageUrl: '/mock/files/design-assets.zip',
      uploadedAt: '2024-05-15T10:15:00.000Z'
    }
  ] as FileObject[],
  ATTACHMENTS: [
    {
      id: 'attach-task-brief',
      projectId: 'proj-admin-onboarding',
      fileId: 'file-team-brief',
      linkedEntity: 'task',
      entityId: 'task-admin-brief',
      createdAt: '2024-05-04T09:05:00.000Z',
      createdBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'attach-task-design-assets',
      projectId: 'proj-admin-onboarding',
      fileId: 'file-design-assets',
      linkedEntity: 'task',
      entityId: 'task-admin-design-library-assets',
      createdAt: '2024-05-16T11:30:00.000Z',
      createdBy: 'designer-1'
    }
  ] as Attachment[],
  DOCUMENTS: [
    {
      id: 'doc-kickoff-notes',
      projectId: 'proj-admin-onboarding',
      title: 'Протокол встречи по онбордингу',
      status: 'active',
      createdAt: '2024-05-02T11:00:00.000Z',
      updatedAt: '2024-05-17T09:00:00.000Z'
    }
  ] as Document[],
  DOCUMENT_VERSIONS: [
    {
      id: 'doc-kickoff-v1',
      documentId: 'doc-kickoff-notes',
      fileId: 'file-team-brief',
      version: 1,
      createdAt: '2024-05-02T11:00:00.000Z',
      createdBy: DEFAULT_WORKSPACE_USER_ID,
      notes: 'Первичный draft'
    }
  ] as DocumentVersion[],
  TASK_COMMENTS: [
    {
      id: 'comment-brief-1',
      projectId: 'proj-admin-onboarding',
      taskId: 'task-admin-brief',
      parentId: null,
      body: 'Команда, проверьте, пожалуйста, бриф перед завтрашней встречей.',
      mentions: ['user.demo@collabverse.test'],
      authorId: DEFAULT_WORKSPACE_USER_ID,
      attachments: ['file-team-brief'],
      createdAt: '2024-05-04T09:10:00.000Z',
      updatedAt: '2024-05-04T09:10:00.000Z'
    }
  ] as TaskComment[],
  PROJECTS: [
    {
      id: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      key: 'ONBD',
      title: 'Онбординг команды Collabstep',
      description: 'Первые шаги команды после запуска платформы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      status: 'active' as ProjectStatus,
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
      key: 'LAND',
      title: 'Редизайн лендинга (архив)',
      description: 'Завершённая инициатива по обновлению главной страницы.',
      ownerId: DEFAULT_WORKSPACE_USER_ID,
      status: 'archived' as ProjectStatus,
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
      number: 1,
      parentId: null,
      title: 'Подготовить бриф и дорожную карту',
      description: 'Сформировать цели, KPI и ритуалы команды.',
      status: 'in_progress',
      assigneeId: DEFAULT_WORKSPACE_USER_ID,
      labels: ['Стратегия', 'Команда'],
      estimatedTime: 32,
      loggedTime: 18,
      createdAt: '2024-05-02T09:00:00.000Z',
      updatedAt: '2024-06-08T14:20:00.000Z'
    },
    {
      id: 'task-admin-brief-kickoff',
      projectId: 'proj-admin-onboarding',
      number: 2,
      parentId: 'task-admin-brief',
      title: 'Провести стартовую сессию',
      description: 'Согласовать ключевые deliverables и зоны ответственности.',
      status: 'new',
      assigneeId: 'user.demo@collabverse.test',
      estimatedTime: 6,
      loggedTime: 0,
      createdAt: '2024-05-03T10:00:00.000Z',
      updatedAt: '2024-05-15T12:00:00.000Z'
    },
    {
      id: 'task-admin-brief-survey',
      projectId: 'proj-admin-onboarding',
      number: 3,
      parentId: 'task-admin-brief',
      title: 'Собрать ожидания стейкхолдеров',
      description: 'Интервьюировать ключевых участников и собрать потребности.',
      status: 'review',
      iterationId: 'iter-admin-onboarding-sprint-1',
      estimatedTime: 14,
      loggedTime: 12,
      createdAt: '2024-05-05T11:30:00.000Z',
      updatedAt: '2024-06-07T18:45:00.000Z'
    },
    {
      id: 'task-admin-brief-survey-report',
      projectId: 'proj-admin-onboarding',
      number: 4,
      parentId: 'task-admin-brief-survey',
      title: 'Подготовить отчёт по интервью',
      status: 'in_progress',
      estimatedTime: 10,
      loggedTime: 5,
      createdAt: '2024-05-06T13:00:00.000Z',
      updatedAt: '2024-06-09T09:10:00.000Z'
    },
    {
      id: 'task-admin-design',
      projectId: 'proj-admin-onboarding',
      number: 5,
      parentId: null,
      title: 'Собрать дизайн-концепты',
      description: 'Подготовить варианты визуального языка продукта.',
      status: 'review',
      assigneeId: 'designer-1',
      labels: ['Дизайн'],
      estimatedTime: 24,
      loggedTime: 19,
      createdAt: '2024-05-12T11:00:00.000Z',
      updatedAt: '2024-06-09T10:30:00.000Z'
    },
    {
      id: 'task-admin-design-library',
      projectId: 'proj-admin-onboarding',
      number: 6,
      parentId: 'task-admin-design',
      title: 'Собрать UI-кит',
      description: 'Сверстать компоненты, состояния и адаптивные варианты.',
      status: 'in_progress',
      assigneeId: 'designer-1',
      estimatedTime: 20,
      loggedTime: 11,
      createdAt: '2024-05-13T09:30:00.000Z',
      updatedAt: '2024-06-09T11:00:00.000Z'
    },
    {
      id: 'task-admin-design-library-assets',
      projectId: 'proj-admin-onboarding',
      number: 7,
      parentId: 'task-admin-design-library',
      title: 'Подготовить ассеты для презентации',
      description: 'Экспортировать макеты и сделать превью для команды.',
      status: 'new',
      estimatedTime: 8,
      loggedTime: 0,
      createdAt: '2024-05-14T12:15:00.000Z',
      updatedAt: '2024-06-09T11:10:00.000Z'
    },
    {
      id: 'task-admin-landing-archive-audit',
      projectId: 'proj-admin-landing-archive',
      number: 1,
      parentId: null,
      title: 'Провести аудит контента',
      description: 'Собрать обратную связь и подготовить обновления.',
      status: 'done',
      estimatedTime: 12,
      loggedTime: 13,
      createdAt: '2023-10-15T08:00:00.000Z',
      updatedAt: '2023-11-10T16:00:00.000Z'
    }
  ] as Task[],
  TASK_DEPENDENCIES: [
    // Example: task-admin-design-library-assets blocks task-admin-design-library
    // This would be added when dependencies are created
  ] as TaskDependency[],
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
  AUDIT_LOG: [
    {
      id: 'audit-proj-onboarding-created',
      actorId: DEFAULT_WORKSPACE_USER_ID,
      action: 'project.created',
      projectId: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      entity: { type: 'project', id: 'proj-admin-onboarding' },
      after: { id: 'proj-admin-onboarding', title: 'Онбординг админ-команды' },
      createdAt: '2024-05-01T08:30:00.000Z'
    },
    {
      id: 'audit-task-brief-created',
      actorId: DEFAULT_WORKSPACE_USER_ID,
      action: 'task.created',
      projectId: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      entity: { type: 'task', id: 'task-admin-brief' },
      after: { title: 'Подготовить бриф и дорожную карту', status: 'in_progress' },
      createdAt: '2024-05-02T09:05:00.000Z'
    },
    {
      id: 'audit-task-design-status',
      actorId: 'designer-1',
      action: 'task.status_changed',
      projectId: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      entity: { type: 'task', id: 'task-admin-design-library' },
      before: { status: 'new' },
      after: { status: 'in_progress' },
      createdAt: '2024-05-18T10:00:00.000Z'
    },
    {
      id: 'audit-task-brief-time',
      actorId: DEFAULT_WORKSPACE_USER_ID,
      action: 'task.time_updated',
      projectId: 'proj-admin-onboarding',
      workspaceId: DEFAULT_WORKSPACE_ID,
      entity: { type: 'task', id: 'task-admin-brief-survey' },
      after: { loggedTime: 12, estimatedTime: 14 },
      createdAt: '2024-06-07T19:00:00.000Z'
    }
  ] as AuditLogEntry[],
  EVENTS: [] as DomainEvent[],
  IDEMPOTENCY_KEYS: globalIdempotencyKeys,
  ADMIN_PLATFORM_MODULES: [
    {
      id: 'module-core-dashboard',
      parentId: null,
      code: 'dashboard',
      label: 'Обзор платформы',
      summary: 'Доступ к главному дашборду после входа в приложение.',
      path: '/app/dashboard',
      status: 'enabled',
      defaultAudience: 'everyone',
      testers: [],
      tags: ['core'],
      sortOrder: 10,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-marketing',
      parentId: null,
      code: 'marketing',
      label: 'Маркетинг',
      summary: 'Раздел маркетинга: кампании, исследования, аналитика.',
      path: '/app/marketing',
      status: 'enabled',
      defaultAudience: 'everyone',
      testers: [],
      tags: ['marketing'],
      sortOrder: 20,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-marketing-research',
      parentId: 'module-marketing',
      code: 'marketing.research',
      label: 'Маркетинг — Исследования',
      summary: 'Подраздел, отвечающий за исследования и пользовательские интервью.',
      path: '/app/marketing/research',
      status: 'enabled',
      defaultAudience: 'beta',
      testers: ['designer-1'],
      tags: ['marketing', 'research'],
      sortOrder: 21,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-docs',
      parentId: null,
      code: 'documents',
      label: 'Документы',
      summary: 'Документы, контракты и бренд-репозиторий.',
      path: '/app/docs',
      status: 'enabled',
      defaultAudience: 'everyone',
      testers: [],
      tags: ['documents'],
      sortOrder: 30,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-docs-brand',
      parentId: 'module-docs',
      code: 'documents.brand',
      label: 'Документы — Бренд-репозиторий',
      summary: 'Файлы брендбука, ассеты и гайды.',
      path: '/app/docs/brand-repo',
      status: 'enabled',
      defaultAudience: 'beta',
      testers: ['designer-1'],
      tags: ['documents', 'brand'],
      sortOrder: 31,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-finance',
      parentId: null,
      code: 'finance',
      label: 'Финансы',
      summary: 'Финансовые отчёты, расходы, тарифы.',
      path: '/app/finance',
      status: 'enabled',
      defaultAudience: 'admins',
      testers: ['finance.pm@collabverse.test'],
      tags: ['finance'],
      sortOrder: 40,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-finance-automations',
      parentId: 'module-finance',
      code: 'finance.automations',
      label: 'Финансы — Автоматизации',
      summary: 'Экспериментальные сценарии автоматизации платежей.',
      path: '/app/finance/automations',
      status: 'disabled',
      defaultAudience: 'beta',
      testers: ['finance.pm@collabverse.test'],
      tags: ['finance', 'beta'],
      sortOrder: 41,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-community',
      parentId: null,
      code: 'community',
      label: 'Комьюнити',
      summary: 'Комнаты, события и рейтинг сообщества.',
      path: '/app/community',
      status: 'enabled',
      defaultAudience: 'everyone',
      testers: [],
      tags: ['community'],
      sortOrder: 50,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      id: 'module-ai',
      parentId: null,
      code: 'aiHub',
      label: 'AI-хаб',
      summary: 'AI-агенты, генерации и промпты.',
      path: '/app/ai-hub',
      status: 'enabled',
      defaultAudience: 'beta',
      testers: ['designer-1'],
      tags: ['ai'],
      sortOrder: 60,
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    }
  ] as PlatformModule[],
  ADMIN_USER_CONTROLS: [
    {
      userId: DEFAULT_WORKSPACE_USER_ID,
      status: 'active',
      roles: ['productAdmin', 'featureAdmin'],
      testerAccess: ['module-ai', 'module-marketing-research', 'module-docs-brand'],
      notes: 'Главный администратор демо-окружения.',
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      userId: 'user.demo@collabverse.test',
      status: 'active',
      roles: ['viewer'],
      testerAccess: ['module-community'],
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      userId: 'finance.pm@collabverse.test',
      status: 'active',
      roles: ['financeAdmin', 'betaTester'],
      testerAccess: ['module-finance', 'module-finance-automations'],
      notes: 'Ответственный за финансовые автоматизации.',
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    },
    {
      userId: 'designer-1',
      status: 'invited',
      roles: ['betaTester'],
      testerAccess: ['module-marketing-research', 'module-docs-brand', 'module-ai'],
      notes: 'UI/UX тестирование новых разделов.',
      updatedAt: '2024-06-10T12:00:00.000Z',
      updatedBy: DEFAULT_WORKSPACE_USER_ID
    }
  ] as PlatformUserControl[]
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
