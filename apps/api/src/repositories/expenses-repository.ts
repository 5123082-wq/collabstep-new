import { memory } from '../data/memory';
import type { Expense, ExpenseAttachment, ExpenseStatus } from '../types';

function cloneExpense(expense: Expense): Expense {
  return { ...expense };
}

function cloneAttachment(attachment: ExpenseAttachment): ExpenseAttachment {
  return { ...attachment };
}

export interface ExpenseFilters {
  workspaceId?: string;
  projectId?: string;
  status?: ExpenseStatus;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export class ExpensesRepository {
  list(filters: ExpenseFilters = {}): Expense[] {
    const { workspaceId, projectId, status, category, dateFrom, dateTo, search } = filters;
    const normalizedSearch = search?.trim().toLowerCase();
    return memory.EXPENSES.filter((expense) => {
      if (workspaceId && expense.workspaceId !== workspaceId) {
        return false;
      }
      if (projectId && expense.projectId !== projectId) {
        return false;
      }
      if (status && expense.status !== status) {
        return false;
      }
      if (category && expense.category !== category) {
        return false;
      }
      if (dateFrom && expense.date < dateFrom) {
        return false;
      }
      if (dateTo && expense.date > dateTo) {
        return false;
      }
      if (normalizedSearch) {
        const haystack = `${expense.vendor ?? ''} ${expense.description ?? ''}`.toLowerCase();
        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }
      return true;
    }).map(cloneExpense);
  }

  listByIds(ids: string[]): Expense[] {
    const set = new Set(ids);
    return memory.EXPENSES.filter((expense) => set.has(expense.id)).map(cloneExpense);
  }

  findById(id: string): Expense | null {
    const expense = memory.EXPENSES.find((item) => item.id === id);
    return expense ? cloneExpense(expense) : null;
  }

  insert(expense: Expense): Expense {
    memory.EXPENSES.push(expense);
    return cloneExpense(expense);
  }

  update(
    id: string,
    patch: Partial<Omit<Expense, 'id' | 'createdBy' | 'createdAt' | 'workspaceId' | 'projectId' | 'taskId' | 'taxAmount'>> & {
      taxAmount?: string | null;
      taskId?: string | null;
    }
  ): Expense | null {
    const index = memory.EXPENSES.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const current = memory.EXPENSES[index];
    if (!current) {
      return null;
    }
    const { taskId, taxAmount, ...rest } = patch;
    const next: Expense = {
      ...current,
      ...(rest as Partial<
        Omit<Expense, 'id' | 'createdBy' | 'createdAt' | 'workspaceId' | 'projectId' | 'taskId' | 'taxAmount'>
      >),
      id: current.id,
      workspaceId: current.workspaceId,
      projectId: current.projectId,
      createdAt: current.createdAt,
      createdBy: current.createdBy
    };

    if (typeof taskId === 'string') {
      next.taskId = taskId;
    } else if (taskId === null) {
      delete (next as { taskId?: string }).taskId;
    }

    if (typeof taxAmount === 'string') {
      next.taxAmount = taxAmount;
    } else if (taxAmount === null) {
      delete (next as { taxAmount?: string }).taxAmount;
    }
    memory.EXPENSES[index] = next;
    return cloneExpense(next);
  }

  saveAttachment(attachment: ExpenseAttachment): ExpenseAttachment {
    memory.EXPENSE_ATTACHMENTS.push(attachment);
    return cloneAttachment(attachment);
  }

  listAttachments(expenseId: string): ExpenseAttachment[] {
    return memory.EXPENSE_ATTACHMENTS.filter((file) => file.expenseId === expenseId).map(cloneAttachment);
  }
}

export const expensesRepository = new ExpensesRepository();
