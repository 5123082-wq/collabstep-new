import type { ID } from '@/domain/projects/types';

export interface TaskDependency {
  id: ID;
  dependentTaskId: ID; // Task that is blocked
  blockerTaskId: ID; // Task that blocks
  type: 'blocks' | 'relates_to';
  createdAt: string;
}

