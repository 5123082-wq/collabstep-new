export type ID = string;

export type ProjectStage = 'discovery' | 'design' | 'build' | 'launch' | 'support';
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
  title: string;
  description?: string;
  ownerId: ID;
  deadline?: string;
  stage?: ProjectStage;
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
  role: 'owner' | 'admin' | 'coord' | 'member' | 'viewer';
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
