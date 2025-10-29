'use client';

import { create } from 'zustand';
import type { ProjectWorkflow, Task, TaskStatus, TaskTreeNode } from '@/domain/projects/types';

type TaskView = 'kanban' | 'list';

type StatusFilter = 'all' | TaskStatus;

type ProjectTasksState = {
  projectId: string | null;
  initialized: boolean;
  view: TaskView;
  statusFilter: StatusFilter;
  iterationFilter: 'all' | string;
  isLoading: boolean;
  isWorkflowLoading: boolean;
  isIterationsLoading: boolean;
  error: string | null;
  tasks: Task[];
  tree: TaskTreeNode[];
  workflow: ProjectWorkflow | null;
  iterations: { id: string; title: string }[];
  setProject: (projectId: string) => void;
  setView: (view: TaskView) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setIterationFilter: (iterationId: 'all' | string) => void;
  loadTasks: () => Promise<void>;
  loadWorkflow: () => Promise<void>;
  loadIterations: () => Promise<void>;
  hydrate: (projectId: string) => Promise<void>;
  reset: () => void;
};

const defaultState = {
  projectId: null,
  initialized: false,
  view: 'kanban' as TaskView,
  statusFilter: 'all' as StatusFilter,
  iterationFilter: 'all' as 'all' | string,
  isLoading: false,
  isWorkflowLoading: false,
  isIterationsLoading: false,
  error: null as string | null,
  tasks: [] as Task[],
  tree: [] as TaskTreeNode[],
  workflow: null as ProjectWorkflow | null,
  iterations: [] as { id: string; title: string }[]
};

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || 'Request failed');
  }
  return (await response.json()) as T;
}

function flattenTaskTree(nodes: TaskTreeNode[]): Task[] {
  const result: Task[] = [];

  const walk = (node: TaskTreeNode) => {
    const { children, ...task } = node;
    result.push({ ...(task as Task) });
    if (Array.isArray(children)) {
      children.forEach((child) => walk(child));
    }
  };

  nodes.forEach((node) => walk(node));
  return result;
}

function buildTaskTreeFromFlat(items: Task[]): TaskTreeNode[] {
  const nodes = new Map<string, TaskTreeNode>();
  const roots: TaskTreeNode[] = [];

  items.forEach((task) => {
    nodes.set(task.id, { ...task });
  });

  nodes.forEach((node) => {
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
  });

  return roots;
}

export const useProjectTasksStore = create<ProjectTasksState>((set, get) => ({
  ...defaultState,
  setProject: (projectId) => set({ projectId }),
  setView: (view) => set({ view }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setIterationFilter: (iterationId) => set({ iterationFilter: iterationId }),
  reset: () => set({ ...defaultState }),
  loadWorkflow: async () => {
    const { projectId } = get();
    if (!projectId) {
      return;
    }
    set({ isWorkflowLoading: true });
    try {
      const workflow = await fetchJson<ProjectWorkflow>(`/api/projects/${projectId}/workflow`);
      set({ workflow });
    } catch (err) {
      console.error(err);
      set({
        workflow: { projectId, statuses: ['new', 'in_progress', 'review', 'done'] },
        error: err instanceof Error ? err.message : 'Не удалось загрузить workflow'
      });
    } finally {
      set({ isWorkflowLoading: false });
    }
  },
  loadIterations: async () => {
    const { projectId } = get();
    if (!projectId) {
      return;
    }
    set({ isIterationsLoading: true });
    try {
      const data = await fetchJson<{ items?: { id: string; title: string }[] }>(
        `/api/projects/${projectId}/iterations`
      );
      set({ iterations: Array.isArray(data.items) ? data.items : [] });
    } catch (err) {
      console.error(err);
      set({ iterations: [] });
    } finally {
      set({ isIterationsLoading: false });
    }
  },
  loadTasks: async () => {
    const { projectId, statusFilter, iterationFilter } = get();
    if (!projectId) {
      return;
    }
    const params = new URLSearchParams();
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (iterationFilter !== 'all' && iterationFilter) {
      params.set('iterationId', iterationFilter);
    }
    params.set('view', 'tree');

    set({ isLoading: true, error: null });
    try {
      const data = await fetchJson<{ items?: Task[]; tree?: TaskTreeNode[] }>(
        `/api/projects/${projectId}/tasks?${params.toString()}`
      );

      const tree = Array.isArray(data.tree)
        ? data.tree
        : Array.isArray(data.items)
          ? buildTaskTreeFromFlat(data.items)
          : [];
      const tasks = Array.isArray(data.items)
        ? data.items
        : flattenTaskTree(tree);

      set({ tasks, tree, isLoading: false });
    } catch (err) {
      console.error(err);
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить задачи'
      });
    }
  },
  hydrate: async (projectId: string) => {
    set({ projectId, initialized: true });
    await Promise.all([get().loadWorkflow(), get().loadIterations(), get().loadTasks()]);
  }
}));

export type { ProjectTasksState };
