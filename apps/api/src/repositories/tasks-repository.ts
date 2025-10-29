import { memory } from '../data/memory';
import type { Task, TaskStatus, TaskTreeNode } from '../types';

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

function cloneTask(task: Task): Task {
  const { labels, ...rest } = task;
  const clone: Task = { ...(rest as Task) };
  if (Array.isArray(labels)) {
    clone.labels = [...labels];
  } else {
    delete (clone as { labels?: string[] }).labels;
  }
  return clone;
}

export class TasksRepository {
  list(options?: TaskListOptions & { view?: 'list' }): Task[];
  list(options: TaskListOptions & { view: 'tree' }): TaskTreeNode[];
  list(options: TaskListOptions = {}): Task[] | TaskTreeNode[] {
    const { projectId, status, iterationId, view = 'list' } = options;
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

    const cloned = items.map(cloneTask);
    if (view === 'tree') {
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
    const id = input.id ?? crypto.randomUUID();
    const parentId = input.parentId ?? null;

    if (parentId) {
      assertValidParent(parentId, input.projectId, id);
    }

    const task: Task = {
      id,
      projectId: input.projectId,
      parentId,
      title: input.title,
      description: input.description ?? '',
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
    return cloneTask(task);
  }
}

export const tasksRepository = new TasksRepository();

function assertValidParent(parentId: string, projectId: string, childId?: string): void {
  const visited = new Set<string>();
  let currentId: string | null = parentId;

  while (currentId) {
    if (visited.has(currentId)) {
      throw new Error('Task hierarchy cycle detected');
    }
    visited.add(currentId);

    if (childId && currentId === childId) {
      throw new Error('Task cannot be its own parent');
    }

    const parent = memory.TASKS.find((task) => task.id === currentId);
    if (!parent) {
      throw new Error('Parent task not found');
    }
    if (parent.projectId !== projectId) {
      throw new Error('Parent task must belong to the same project');
    }

    currentId = parent.parentId ?? null;
  }
}

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
