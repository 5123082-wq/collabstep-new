export type ID = string;

export type ProjectStage = 'discovery' | 'design' | 'build' | 'launch' | 'support';
export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskKind = 'epic' | 'task' | 'subtask';

export interface TaskChecklistItem {
  id: ID;
  title: string;
  done: boolean;
}

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

export type ProjectType = 'product' | 'marketing' | 'operations' | 'service' | 'internal';

export interface Project {
  id: ID;
  workspaceId: ID;
  title: string;
  description?: string;
  ownerId: ID;
  deadline?: string;
  stage?: ProjectStage;
  type?: ProjectType;
  visibility: 'private' | 'public';
  workflowId?: ID;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
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
  kind?: TaskKind;
  order?: number;
  estimateMinutes?: number;
  spentMinutes?: number;
  checklist?: TaskChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskHierarchyNode extends Task {
  depth: number;
  ancestors: ID[];
  children: TaskHierarchyNode[];
  progress: {
    total: number;
    done: number;
    percentage: number | null;
  };
}
