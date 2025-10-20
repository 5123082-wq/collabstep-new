import type { Iteration, Project, ProjectWorkflow, Task } from '@/domain/projects/types';

export const memory = {
  PROJECTS: [] as Project[],
  TASKS: [] as Task[],
  WORKFLOWS: {} as Record<string, ProjectWorkflow>,
  ITERATIONS: [] as Iteration[]
};
