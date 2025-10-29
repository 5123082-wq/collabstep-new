import { memory } from '../data/memory';
import type { FileObject, Task, TaskStatus, TaskTreeNode } from '../types';

type TaskListView = 'list' | 'tree';

export type TaskListOptions = {
  projectId?: string;
  status?: TaskStatus;
  iterationId?: string;
  view?: TaskListView;
};

export type CreateTaskInput = {
  id?: string;
  projectId: string;
  parentId?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  iterationId?: string;
  assigneeId?: string;
  startAt?: string;
  dueAt?: string;
  priority?: 'low' | 'med' | 'high';
  labels?: string[];
  createdAt?: string;
  updatedAt?: string;
};

function enrichTask(task: Task): Task {
  const { labels, ...rest } = task;
  const clone: Task = { ...(rest as Task) };
  if (Array.isArray(labels)) {
    clone.labels = [...labels];
  } else {
    delete (clone as { labels?: string[] }).labels;
  }
  clone.attachments = resolveTaskAttachments(task.id);
  return clone;
}

function resolveTaskAttachments(taskId: string): FileObject[] {
  const attachments = memory.ATTACHMENTS.filter(
    (attachment) => attachment.linkedEntity === 'task' && attachment.entityId === taskId
  );
  if (attachments.length === 0) {
    return [];
  }
  const fileLookup = new Map(memory.FILES.map((file) => [file.id, file] as const));
  return attachments
    .map((attachment) => fileLookup.get(attachment.fileId))
    .filter((file): file is FileObject => Boolean(file))
    .map(cloneFileObject);
}

function cloneFileObject(file: FileObject): FileObject {
  return { ...file };
}

export class TasksRepository {
  list(options?: TaskListOptions & { view?: 'list' }): Task[];
  list(options: TaskListOptions & { view: 'tree' }): TaskTreeNode[];
  list(options: TaskListOptions = {}): Task[] | TaskTreeNode[] {
    const { projectId, status, iterationId, view = 'list' } = options;
    const normalizedView: TaskListView = view === 'tree' ? 'tree' : 'list';
    let items = memory.TASKS;
    if (projectId) {
      items = items.filter((task) => task.projectId === projectId);
    }
    if (status) {
      items = items.filter((task) => task.status === status);
    }
    if (iterationId) {
      items = items.filter((task) => task.iterationId === iterationId);
    }

    const cloned = items.map(enrichTask);
    if (normalizedView === 'tree') {
      return buildTaskTree(cloned);
    }
    return cloned;
  }

  listByProject(projectId: string): Task[] {
    return this.list({ projectId });
  }

  create(input: CreateTaskInput): Task {
    const now = new Date().toISOString();
    const createdAt = input.createdAt ?? now;
    const updatedAt = input.updatedAt ?? createdAt;
    const task: Task = {
      id: input.id ?? crypto.randomUUID(),
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? '',
      parentId: input.parentId ?? null,
      status: input.status,
      createdAt,
      updatedAt,
      ...(input.iterationId ? { iterationId: input.iterationId } : {}),
      ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
      ...(input.startAt ? { startAt: input.startAt } : {}),
      ...(input.dueAt ? { dueAt: input.dueAt } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(Array.isArray(input.labels) ? { labels: [...input.labels] } : {})
    };

    memory.TASKS.push(task);
    return enrichTask(task);
  }
}

export const tasksRepository = new TasksRepository();

function buildTaskTree(tasks: Task[]): TaskTreeNode[] {
  const nodes = new Map<string, TaskTreeNode>();
  const roots: TaskTreeNode[] = [];

  for (const task of tasks) {
    nodes.set(task.id, { ...task });
  }

  for (const node of nodes.values()) {
    const parentId = node.parentId ?? null;
    if (parentId && nodes.has(parentId)) {
      const parent = nodes.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots.map(compactChildren);
}

function compactChildren(node: TaskTreeNode): TaskTreeNode {
  if (node.children && node.children.length > 0) {
    node.children = node.children.map(compactChildren);
  } else {
    delete node.children;
  }
  return node;
}
