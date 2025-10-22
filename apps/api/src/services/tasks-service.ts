import { memory } from '../data/memory';
import { tasksRepository, type TaskCreateInput, type TaskListOptions, type TaskPatchInput } from '../repositories/tasks-repository';
import type { Task, TaskStatus } from '../types';

export class InvalidTaskStatusError extends Error {
  constructor(status: string) {
    super(`Invalid status: ${status}`);
    this.name = 'InvalidTaskStatusError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}

type TaskCreatePayload = Omit<TaskCreateInput, 'status' | 'projectId'> & {
  status?: TaskStatus;
};

type TaskBulkStatusPayload = {
  taskIds: string[];
  toStatus: TaskStatus;
};

type TaskBulkIterationPayload = {
  taskIds: string[];
  iterationId: string | null;
};

function getWorkflowStatuses(projectId: string): TaskStatus[] {
  return memory.WORKFLOWS[projectId]?.statuses ?? ['new', 'in_progress', 'review', 'done'];
}

function assertStatusAllowed(projectId: string, status: TaskStatus) {
  const workflow = getWorkflowStatuses(projectId);
  if (!workflow.includes(status)) {
    throw new InvalidTaskStatusError(status);
  }
}

function ensureTaskInProject(task: Task | null, projectId: string): Task {
  if (!task || task.projectId !== projectId) {
    throw new TaskNotFoundError(task ? task.id : 'unknown');
  }
  return task;
}

export class TasksService {
  list(options: TaskListOptions): Task[] {
    return tasksRepository.list(options);
  }

  listByProject(projectId: string, filters: Omit<TaskListOptions, 'projectId'> = {}): Task[] {
    return tasksRepository.list({ projectId, ...filters });
  }

  create(projectId: string, payload: TaskCreatePayload): Task {
    const workflow = getWorkflowStatuses(projectId);
    const status = payload.status ?? workflow[0] ?? 'new';
    assertStatusAllowed(projectId, status);
    return tasksRepository.create({ ...payload, projectId, status });
  }

  update(projectId: string, taskId: string, patch: TaskPatchInput): Task {
    if (patch.status) {
      assertStatusAllowed(projectId, patch.status);
    }
    const task = tasksRepository.findById(taskId);
    ensureTaskInProject(task, projectId);
    const updated = tasksRepository.update(taskId, patch);
    if (!updated) {
      throw new TaskNotFoundError(taskId);
    }
    return updated;
  }

  delete(projectId: string, taskId: string): void {
    const task = tasksRepository.findById(taskId);
    ensureTaskInProject(task, projectId);
    const removed = tasksRepository.delete(taskId);
    if (!removed) {
      throw new TaskNotFoundError(taskId);
    }
  }

  transition(projectId: string, taskId: string, toStatus: TaskStatus): Task {
    assertStatusAllowed(projectId, toStatus);
    const task = tasksRepository.findById(taskId);
    ensureTaskInProject(task, projectId);
    const updated = tasksRepository.update(taskId, { status: toStatus });
    if (!updated) {
      throw new TaskNotFoundError(taskId);
    }
    return updated;
  }

  bulkSetStatus(projectId: string, payload: TaskBulkStatusPayload): Task[] {
    assertStatusAllowed(projectId, payload.toStatus);
    const ids = payload.taskIds.filter(Boolean);
    if (ids.length === 0) {
      return [];
    }
    const allowedIds = ids.filter((taskId) => {
      const task = tasksRepository.findById(taskId);
      return task?.projectId === projectId;
    });
    if (allowedIds.length === 0) {
      return [];
    }
    return tasksRepository.bulkUpdate(allowedIds, { status: payload.toStatus });
  }

  bulkSetIteration(projectId: string, payload: TaskBulkIterationPayload): Task[] {
    const ids = payload.taskIds.filter(Boolean);
    if (ids.length === 0) {
      return [];
    }
    const allowedIds = ids.filter((taskId) => {
      const task = tasksRepository.findById(taskId);
      return task?.projectId === projectId;
    });
    if (allowedIds.length === 0) {
      return [];
    }
    return tasksRepository.bulkUpdate(allowedIds, { iterationId: payload.iterationId ?? undefined });
  }
}

export const tasksService = new TasksService();
