import { randomUUID } from 'node:crypto';
import type { Task, TaskChecklistItem, TaskHierarchyNode, TaskStatus } from '@/domain/projects/types';

export type TaskHierarchyFilters = {
  status?: TaskStatus | null;
  iterationId?: string | null;
};

export type TaskHierarchyResult = {
  tree: TaskHierarchyNode[];
  flat: TaskHierarchyNode[];
  stats: {
    total: number;
    matching: number;
    byStatus: Record<TaskStatus, number>;
  };
};

function compareTasks(a: Task, b: Task) {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  if (Number.isFinite(timeA) && Number.isFinite(timeB) && timeA !== timeB) {
    return timeA - timeB;
  }
  return a.title.localeCompare(b.title, 'ru');
}

function computeProgress(checklist?: TaskChecklistItem[] | null) {
  if (!Array.isArray(checklist) || checklist.length === 0) {
    return { total: 0, done: 0, percentage: null as number | null };
  }
  const total = checklist.length;
  const done = checklist.filter((item) => item.done).length;
  const percentage = total === 0 ? null : Math.round((done / total) * 100);
  return { total, done, percentage };
}

export function buildTaskHierarchy(tasks: Task[], filters: TaskHierarchyFilters = {}): TaskHierarchyResult {
  const byId = new Map<string, TaskHierarchyNode>();
  const baseNodes: TaskHierarchyNode[] = tasks.map((task) => {
    const baseChecklist = Array.isArray(task.checklist) ? task.checklist.map((item) => ({ ...item })) : undefined;
    const { parentId, ...rest } = task;
    const node: TaskHierarchyNode = {
      ...rest,
      ...(typeof parentId === 'string' && parentId ? { parentId } : {}),
      checklist: baseChecklist,
      children: [],
      ancestors: [],
      depth: 0,
      progress: computeProgress(baseChecklist)
    };
    byId.set(node.id, node);
    return node;
  });

  const roots: TaskHierarchyNode[] = [];
  for (const node of baseNodes) {
    if (node.parentId && byId.has(node.parentId)) {
      const parent = byId.get(node.parentId);
      parent?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const visit = (node: TaskHierarchyNode, depth: number, ancestors: string[]) => {
    node.depth = depth;
    node.ancestors = ancestors;
    node.children.sort(compareTasks);
    node.children.forEach((child) => visit(child, depth + 1, [...ancestors, node.id]));
  };

  roots.sort(compareTasks);
  roots.forEach((node) => visit(node, 0, []));

  const stats = {
    total: baseNodes.length,
    matching: 0,
    byStatus: {
      new: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      blocked: 0
    } as Record<TaskStatus, number>
  };

  const matchesFilter = (task: Task) => {
    const statusOk = filters.status ? task.status === filters.status : true;
    const iterationOk = filters.iterationId ? task.iterationId === filters.iterationId : true;
    return statusOk && iterationOk;
  };

  const prune = (node: TaskHierarchyNode): TaskHierarchyNode | null => {
    const children: TaskHierarchyNode[] = [];
    for (const child of node.children) {
      const pruned = prune(child);
      if (pruned) {
        children.push(pruned);
      }
    }
    const selfMatches = matchesFilter(node);
    const keep = selfMatches || children.length > 0 || (!filters.status && !filters.iterationId);
    if (!keep) {
      return null;
    }
    const clone: TaskHierarchyNode = {
      ...node,
      children,
      progress: computeProgress(node.checklist)
    };
    if (selfMatches) {
      stats.matching += 1;
      stats.byStatus[node.status] = (stats.byStatus[node.status] ?? 0) + 1;
    }
    return clone;
  };

  const tree = roots
    .map((node) => prune(node))
    .filter((node): node is TaskHierarchyNode => Boolean(node));

  const flat: TaskHierarchyNode[] = [];
  const flatten = (node: TaskHierarchyNode) => {
    flat.push(node);
    node.children.forEach((child) => flatten(child));
  };
  tree.forEach((node) => flatten(node));

  if (!filters.status && !filters.iterationId) {
    stats.matching = stats.total;
    stats.byStatus.new = 0;
    stats.byStatus.in_progress = 0;
    stats.byStatus.review = 0;
    stats.byStatus.done = 0;
    stats.byStatus.blocked = 0;
    for (const node of baseNodes) {
      stats.byStatus[node.status] = (stats.byStatus[node.status] ?? 0) + 1;
    }
  }

  return { tree, flat, stats };
}

export function normalizeChecklist(items?: unknown): TaskChecklistItem[] | undefined {
  if (!Array.isArray(items)) {
    return undefined;
  }
  const normalized: TaskChecklistItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const title = typeof (raw as { title?: unknown }).title === 'string' ? (raw as { title: string }).title.trim() : '';
    if (!title) {
      continue;
    }
    const done = Boolean((raw as { done?: unknown }).done);
    const idCandidate = (raw as { id?: unknown }).id;
    const id = typeof idCandidate === 'string' && idCandidate ? idCandidate : randomUUID();
    normalized.push({ id, title, done });
  }
  return normalized;
}
