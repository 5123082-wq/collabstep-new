export type ID = string;

export type ProjectStage = 'discovery' | 'design' | 'build' | 'launch' | 'support';
export type ProjectVisibility = 'private' | 'public';
export type ProjectType =
  | 'product'
  | 'marketing'
  | 'operations'
  | 'service'
  | 'internal';
export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'blocked';
export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'payable' | 'closed';

export interface ProjectWorkflow {
  projectId: ID;
  statuses: TaskStatus[];
}

export interface Iteration {
  id: ID;
  projectId: ID;
  title: string;
  start?: string;
  end?: string;
}

export interface Project {
  id: ID;
  workspaceId: ID;
  title: string;
  description?: string;
  ownerId: ID;
  deadline?: string;
  stage?: ProjectStage;
  type?: ProjectType;
  visibility: ProjectVisibility;
  budgetPlanned: number | null;
  budgetSpent: number | null;
  workflowId?: ID;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: ID;
  title: string;
  kind: string;
  summary: string;
}

export interface ProjectMember {
  userId: ID;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface Task {
  id: ID;
  projectId: ID;
  parentId?: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  iterationId?: ID;
  assigneeId?: ID;
  startAt?: string;
  dueAt?: string;
  priority?: 'low' | 'med' | 'high';
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CatalogProject extends Project {
  tasksCount: number;
  labels: string[];
}

export interface ExpenseAttachment {
  id: ID;
  expenseId: ID;
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface Expense {
  id: ID;
  workspaceId: ID;
  projectId: ID;
  taskId?: ID;
  date: string;
  amount: string;
  currency: string;
  category: string;
  description?: string;
  vendor?: string;
  paymentMethod?: string;
  taxAmount?: string;
  status: ExpenseStatus;
  createdBy: ID;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudgetCategoryLimit {
  name: string;
  limit?: string;
}

export interface ProjectBudget {
  projectId: ID;
  currency: string;
  total?: string;
  warnThreshold?: number;
  categories?: ProjectBudgetCategoryLimit[];
  updatedAt: string;
}

export interface ProjectBudgetUsageCategory extends ProjectBudgetCategoryLimit {
  spent: string;
}

export interface ProjectBudgetSnapshot extends ProjectBudget {
  spentTotal: string;
  remainingTotal?: string;
  categoriesUsage: ProjectBudgetUsageCategory[];
}

export interface AuditLogEntry {
  id: ID;
  workspaceId?: ID;
  projectId?: ID;
  entity: {
    type: string;
    id: ID;
  };
  actorId: ID;
  action: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export interface DomainEvent<TPayload = unknown> {
  id: ID;
  type: string;
  entityId: ID;
  payload?: TPayload;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'archived';

export interface WorkspaceUser {
  id: ID;
  name: string;
  email: string;
  title?: string;
  avatarUrl?: string;
  department?: string;
  location?: string;
}

export interface ProjectCardTaskStats {
  total: number;
  overdue: number;
  important: number;
  completed: number;
}

export interface ProjectCardOwner extends WorkspaceUser {}

export interface ProjectCardMember extends WorkspaceUser {
  role: ProjectMember['role'];
}

export interface ProjectCardWorkspace {
  id: ID;
  name: string;
}

export interface ProjectCard {
  id: ID;
  workspace: ProjectCardWorkspace;
  title: string;
  description: string;
  type?: ProjectType;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  owner: ProjectCardOwner;
  members: ProjectCardMember[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  progress: number;
  tasks: ProjectCardTaskStats;
  budget: {
    planned: string | null;
    spent: string | null;
  };
  permissions: {
    // [PLAN:S2-110] Stage 2 cards раскрывают действия по ролям для обзора проектов.
    canArchive: boolean;
    canInvite: boolean;
    canCreateTask: boolean;
    canView: boolean;
  };
  deadline?: string;
  stage?: ProjectStage;
  workflowId?: ID;
}

export interface ProjectCardFilters {
  status?: 'all' | ProjectStatus;
  ownerIds?: ID[];
  memberIds?: ID[];
  tags?: string[];
  dateField?: 'createdAt' | 'deadline';
  dateFrom?: string | null;
  dateTo?: string | null;
  workspaceIds?: ID[];
  visibility?: ProjectVisibility | 'all';
  types?: ProjectType[];
}

export interface Workspace {
  id: ID;
  accountId: ID;
  name: string;
  description?: string;
  visibility: ProjectVisibility;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  workspaceId: ID;
  userId: ID;
  role: ProjectMember['role'];
}

export interface Account {
  id: ID;
  name: string;
  ownerId: ID;
  createdAt: string;
  updatedAt: string;
}

export interface AccountMember {
  accountId: ID;
  userId: ID;
  role: ProjectMember['role'];
}
