import type { WorkspaceUser } from '@collabverse/api';

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

export type ProjectType = 'product' | 'marketing' | 'operations' | 'service' | 'internal';

export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: ID;
  workspaceId: ID;
  key: string; // Unique project key per workspace (e.g., "PROJ", "ABC")
  title: string;
  description?: string;
  ownerId: ID;
  status: ProjectStatus; // Lifecycle status
  deadline?: string;
  stage?: ProjectStage;
  type?: ProjectType;
  visibility: 'private' | 'public';
  budgetPlanned: number | null;
  budgetSpent: number | null;
  workflowId?: ID;
  archived: boolean; // Legacy field, kept for backward compatibility
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: ID;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface FileObject {
  id: ID;
  uploaderId: ID;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  uploadedAt: string;
  sha256?: string;
  description?: string;
}

export type AttachmentEntityType = 'project' | 'task' | 'comment' | 'document';

export interface Attachment {
  id: ID;
  projectId: ID;
  fileId: ID;
  linkedEntity: AttachmentEntityType;
  entityId: ID | null;
  createdAt: string;
  createdBy: ID;
  file?: FileObject | null;
}

export interface Task {
  id: ID;
  projectId: ID;
  number: number; // Auto-increment per project (e.g., PROJ-123)
  parentId: ID | null;
  title: string;
  description?: string;
  status: TaskStatus;
  iterationId?: ID;
  assigneeId?: ID;
  startAt?: string; // Start date
  startDate?: string; // Alias for startAt
  dueAt?: string; // Due date
  priority?: 'low' | 'med' | 'high' | 'urgent';
  labels?: string[];
  attachments?: FileObject[];
  estimatedTime?: number | null; // In hours
  storyPoints?: number | null; // Story points estimation
  loggedTime?: number | null; // In minutes
  createdAt: string;
  updatedAt: string;
}

export interface TaskTreeNode extends Task {
  children?: TaskTreeNode[];
}

export interface TaskComment {
  id: ID;
  projectId: ID;
  taskId: ID;
  parentId: ID | null;
  body: string;
  mentions: ID[];
  authorId: ID;
  createdAt: string;
  updatedAt: string;
  attachmentsFiles: FileObject[];
  author?: WorkspaceUser | null;
  mentionsDetails?: (WorkspaceUser | null)[];
  children?: TaskComment[];
}

export interface Document {
  id: ID;
  projectId: ID;
  title: string;
  type?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: ID;
  documentId: ID;
  fileId: ID;
  version: number;
  createdBy: ID;
  createdAt: string;
  notes?: string;
  file?: FileObject;
}

export interface DocumentWithVersions extends Document {
  versions: DocumentVersion[];
}
