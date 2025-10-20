import type { Project, Task, ProjectWorkflow, Iteration } from '@/domain/projects/types';

type ProjectsMemory = {
  PROJECTS: Project[];
  TASKS: Task[];
  WORKFLOWS: Record<string, ProjectWorkflow>;
  ITERATIONS: Iteration[];
};

declare global {
  // eslint-disable-next-line no-var
  var __PROJECTS_MEMORY__: ProjectsMemory | undefined;
}

const globalStore = globalThis as typeof globalThis & {
  __PROJECTS_MEMORY__?: ProjectsMemory;
};

if (!globalStore.__PROJECTS_MEMORY__) {
  globalStore.__PROJECTS_MEMORY__ = {
    PROJECTS: [],
    TASKS: [],
    WORKFLOWS: {},
    ITERATIONS: []
  };
}

export const memory = globalStore.__PROJECTS_MEMORY__;
