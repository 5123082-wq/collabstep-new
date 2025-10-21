export type ID = string;

export type ProjectStage = 'discovery' | 'design' | 'build' | 'launch' | 'support';
export type TaskStatus = 'new' | 'in_progress' | 'review' | 'done' | 'blocked';

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
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: ID;
  role: 'owner' | 'coord' | 'member' | 'viewer';
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
