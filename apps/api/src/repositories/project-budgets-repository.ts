import { memory } from '../data/memory';
import type { ProjectBudget, ProjectBudgetSnapshot } from '../types';

type StoredBudget = ProjectBudget | ProjectBudgetSnapshot;

function cloneBudget(budget: StoredBudget): StoredBudget {
  const clone: StoredBudget = { ...budget };
  if (budget.categories) {
    clone.categories = budget.categories.map((category) => ({ ...category }));
  }
  if ('categoriesUsage' in budget) {
    const usage = (budget as ProjectBudgetSnapshot).categoriesUsage;
    (clone as ProjectBudgetSnapshot).categoriesUsage = usage.map((category) => ({ ...category }));
  }
  return clone;
}

export class ProjectBudgetsRepository {
  find(projectId: string): StoredBudget | null {
    const budget = memory.PROJECT_BUDGETS.find((item) => item.projectId === projectId);
    return budget ? cloneBudget(budget) : null;
  }

  upsert(budget: StoredBudget): StoredBudget {
    const index = memory.PROJECT_BUDGETS.findIndex((item) => item.projectId === budget.projectId);
    if (index === -1) {
      memory.PROJECT_BUDGETS.push(budget);
    } else {
      memory.PROJECT_BUDGETS[index] = budget;
    }
    return cloneBudget(budget);
  }
}

export const projectBudgetsRepository = new ProjectBudgetsRepository();
