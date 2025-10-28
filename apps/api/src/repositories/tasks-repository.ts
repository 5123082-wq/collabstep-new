import { memory } from '../data/memory';
import type { Task } from '../types';

function cloneTask(task: Task): Task {
  const { labels, checklist, ...rest } = task;
  const clone: Task = { ...(rest as Task) };
  if (Array.isArray(labels)) {
    clone.labels = [...labels];
  } else {
    delete (clone as { labels?: string[] }).labels;
  }
  if (Array.isArray(checklist)) {
    clone.checklist = checklist.map((item) => ({ ...item }));
  } else {
    delete (clone as { checklist?: Task['checklist'] }).checklist;
  }
  return clone;
}

export class TasksRepository {
  list(): Task[] {
    return memory.TASKS.map(cloneTask);
  }

  listByProject(projectId: string): Task[] {
    return memory.TASKS.filter((task) => task.projectId === projectId).map(cloneTask);
  }
}

export const tasksRepository = new TasksRepository();
