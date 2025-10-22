import { memory } from '../data/memory';
import type { Task, TaskStatus } from '../types';

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

function normalizeLabels(labels?: string[] | null): string[] | undefined {
  if (!Array.isArray(labels)) {
    return undefined;
  }
  const cleaned = labels
    .map((label) => label.trim())
    .filter((label, index, arr) => Boolean(label) && arr.indexOf(label) === index);
  return cleaned.length > 0 ? cleaned : [];
}

export type TaskListOptions = {
  projectId?: string;
  statuses?: TaskStatus[];
  iterationId?: string | null;
  assigneeId?: string | null;
  labels?: string[];
  query?: string;
};

export type TaskCreateInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type TaskPatchInput = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'iterationId'
    | 'assigneeId'
    | 'startAt'
    | 'dueAt'
    | 'priority'
    | 'labels'
  >
>;

export class TasksRepository {
  list(options: TaskListOptions = {}): Task[] {
    const { projectId, statuses, iterationId, assigneeId, labels, query } = options;
    const normalizedStatuses = Array.isArray(statuses) ? statuses.filter(Boolean) : [];
    const normalizedLabels = Array.isArray(labels)
      ? labels
          .map((label) => label.trim().toLowerCase())
          .filter((label, index, arr) => label && arr.indexOf(label) === index)
      : [];
    const search = typeof query === 'string' && query.trim() ? query.trim().toLowerCase() : null;

    return memory.TASKS.filter((task) => {
      if (projectId && task.projectId !== projectId) {
        return false;
      }
      if (normalizedStatuses.length > 0 && !normalizedStatuses.includes(task.status)) {
        return false;
      }
      if (iterationId !== undefined) {
        if (!iterationId && task.iterationId) {
          return false;
        }
        if (iterationId && task.iterationId !== iterationId) {
          return false;
        }
      }
      if (assigneeId !== undefined) {
        if (!assigneeId && task.assigneeId) {
          return false;
        }
        if (assigneeId && task.assigneeId !== assigneeId) {
          return false;
        }
      }
      if (normalizedLabels.length > 0) {
        const taskLabels = (task.labels ?? []).map((label) => label.toLowerCase());
        const hasEveryLabel = normalizedLabels.every((label) => taskLabels.includes(label));
        if (!hasEveryLabel) {
          return false;
        }
      }
      if (search) {
        const haystack = `${task.title ?? ''}\n${task.description ?? ''}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }
      return true;
    }).map(cloneTask);
  }

  findById(id: string): Task | null {
    const task = memory.TASKS.find((item) => item.id === id);
    return task ? cloneTask(task) : null;
  }

  create(payload: TaskCreateInput): Task {
    const now = new Date().toISOString();
    const normalizedLabels = normalizeLabels(payload.labels);
    const task: Task = {
      id: payload.id ?? crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      projectId: payload.projectId,
      title: payload.title ?? 'Новая задача',
      description: payload.description ?? '',
      status: payload.status,
      ...(payload.parentId ? { parentId: payload.parentId } : {}),
      ...(payload.iterationId ? { iterationId: payload.iterationId } : {}),
      ...(payload.assigneeId ? { assigneeId: payload.assigneeId } : {}),
      ...(payload.startAt ? { startAt: payload.startAt } : {}),
      ...(payload.dueAt ? { dueAt: payload.dueAt } : {}),
      ...(payload.priority ? { priority: payload.priority } : {}),
      ...(normalizedLabels ? { labels: normalizedLabels } : {})
    };

    memory.TASKS.push(task);
    return cloneTask(task);
  }

  update(id: string, patch: TaskPatchInput): Task | null {
    const idx = memory.TASKS.findIndex((item) => item.id === id);
    if (idx === -1) {
      return null;
    }
    const current = memory.TASKS[idx];
    if (!current) {
      return null;
    }

    const next: Task = {
      ...current,
      updatedAt: new Date().toISOString()
    };

    if (typeof patch.title === 'string' && patch.title.trim()) {
      next.title = patch.title.trim();
    }
    if (patch.description !== undefined) {
      next.description = patch.description ?? '';
    }
    if (patch.status) {
      next.status = patch.status;
    }
    if (patch.iterationId !== undefined) {
      if (!patch.iterationId) {
        delete next.iterationId;
      } else {
        next.iterationId = patch.iterationId;
      }
    }
    if (patch.assigneeId !== undefined) {
      if (!patch.assigneeId) {
        delete next.assigneeId;
      } else {
        next.assigneeId = patch.assigneeId;
      }
    }
    if (patch.startAt !== undefined) {
      if (!patch.startAt) {
        delete next.startAt;
      } else {
        next.startAt = patch.startAt;
      }
    }
    if (patch.dueAt !== undefined) {
      if (!patch.dueAt) {
        delete next.dueAt;
      } else {
        next.dueAt = patch.dueAt;
      }
    }
    if (patch.priority !== undefined) {
      if (!patch.priority) {
        delete next.priority;
      } else {
        next.priority = patch.priority;
      }
    }
    if (patch.labels !== undefined) {
      const normalized = normalizeLabels(patch.labels);
      if (normalized) {
        next.labels = normalized;
      } else {
        delete next.labels;
      }
    }

    memory.TASKS[idx] = next;
    return cloneTask(next);
  }

  delete(id: string): boolean {
    const idx = memory.TASKS.findIndex((item) => item.id === id);
    if (idx === -1) {
      return false;
    }
    memory.TASKS.splice(idx, 1);
    return true;
  }

  bulkUpdate(ids: string[], patch: TaskPatchInput & { status?: TaskStatus }): Task[] {
    const now = new Date().toISOString();
    const updated: Task[] = [];
    for (const id of ids) {
      const idx = memory.TASKS.findIndex((task) => task.id === id);
      if (idx === -1) {
        continue;
      }
      const current = memory.TASKS[idx];
      if (!current) {
        continue;
      }
      const next: Task = { ...current, updatedAt: now };

      if (patch.status) {
        next.status = patch.status;
      }
      if (patch.iterationId !== undefined) {
        if (!patch.iterationId) {
          delete next.iterationId;
        } else {
          next.iterationId = patch.iterationId;
        }
      }
      if (patch.assigneeId !== undefined) {
        if (!patch.assigneeId) {
          delete next.assigneeId;
        } else {
          next.assigneeId = patch.assigneeId;
        }
      }
      if (patch.labels !== undefined) {
        const normalized = normalizeLabels(patch.labels);
        if (normalized) {
          next.labels = normalized;
        } else {
          delete next.labels;
        }
      }

      memory.TASKS[idx] = next;
      updated.push(cloneTask(next));
    }
    return updated;
  }
}

export const tasksRepository = new TasksRepository();
