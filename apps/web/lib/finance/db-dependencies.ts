import { amountToCents } from '@collabverse/api/utils/money';
import type {
  DbExpenseStoreDependencies,
  ExpenseAggregationFilters,
  ExpenseAggregationRow,
  ExpenseEntityRepository,
  ExpenseFilters,
  ExpenseIdempotencyRepository,
  ExpenseStoreCache
} from '@collabverse/api/repositories/expense-store';
import type { Expense, ExpenseAttachment, ExpenseStatus } from '@collabverse/api/types';

interface ExpenseRecord {
  expense: Expense;
  attachments: ExpenseAttachment[];
}

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

interface FinanceDbState {
  expenses: Map<string, ExpenseRecord>;
  order: string[];
  idempotency: Map<string, string>;
  cache: Map<string, CacheEntry>;
}

const globalScope = globalThis as typeof globalThis & {
  __collabverseFinanceDb__?: FinanceDbState;
};

function cloneExpense(expense: Expense): Expense {
  return { ...expense };
}

function cloneAttachment(attachment: ExpenseAttachment): ExpenseAttachment {
  return { ...attachment };
}

function getFinanceDb(): FinanceDbState {
  if (!globalScope.__collabverseFinanceDb__) {
    globalScope.__collabverseFinanceDb__ = {
      expenses: new Map(),
      order: [],
      idempotency: new Map(),
      cache: new Map()
    };
  }
  return globalScope.__collabverseFinanceDb__;
}

function normalizeSearch(search: string | undefined | null): string | undefined {
  const normalized = search?.trim().toLowerCase();
  return normalized ? normalized : undefined;
}

function matchesFilters(
  expense: Expense,
  filters: ExpenseFilters,
  statuses?: Set<ExpenseStatus>
): boolean {
  const { workspaceId, projectId, status, category, dateFrom, dateTo, search } = filters;

  if (workspaceId && expense.workspaceId !== workspaceId) {
    return false;
  }
  if (projectId && expense.projectId !== projectId) {
    return false;
  }
  if (statuses) {
    if (!statuses.has(expense.status)) {
      return false;
    }
  } else if (status && expense.status !== status) {
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
  if (search) {
    const haystack = `${expense.vendor ?? ''} ${expense.description ?? ''}`.toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
}

function createExpenseRepository(db: FinanceDbState): ExpenseEntityRepository {
  return {
    create: ({ data, attachments }) => {
      const record: ExpenseRecord = {
        expense: cloneExpense(data),
        attachments: attachments?.map(cloneAttachment) ?? []
      };
      db.expenses.set(record.expense.id, record);
      if (!db.order.includes(record.expense.id)) {
        db.order.push(record.expense.id);
      }
      return cloneExpense(record.expense);
    },
    findById: (id) => {
      const record = db.expenses.get(id);
      return record ? cloneExpense(record.expense) : null;
    },
    list: (filters) => {
      const normalizedSearch = normalizeSearch(filters.search);
      const normalizedFilters: ExpenseFilters = {
        ...filters,
        ...(normalizedSearch !== undefined ? { search: normalizedSearch } : {})
      };
      const results: Expense[] = [];
      for (const id of db.order) {
        const record = db.expenses.get(id);
        if (!record) {
          continue;
        }
        if (!matchesFilters(record.expense, normalizedFilters)) {
          continue;
        }
        results.push(cloneExpense(record.expense));
      }
      return results;
    },
    update: (id, { data, attachments }) => {
      const record = db.expenses.get(id);
      if (!record) {
        return null;
      }

      const next: Expense = {
        ...record.expense,
        updatedAt: data.updatedAt ?? new Date().toISOString()
      };

      const { taskId, taxAmount, ...rest } = data;
      const mutableNext = next as unknown as Record<string, unknown>;
      for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined) {
          mutableNext[key] = value;
        }
      }

      if (taskId !== undefined) {
        if (typeof taskId === 'string' && taskId) {
          next.taskId = taskId;
        } else if (taskId === null) {
          delete (next as { taskId?: string }).taskId;
        }
      }

      if (taxAmount !== undefined) {
        if (typeof taxAmount === 'string') {
          next.taxAmount = taxAmount;
        } else if (taxAmount === null) {
          delete (next as { taxAmount?: string }).taxAmount;
        }
      }

      record.expense = next;

      if (attachments?.length) {
        for (const attachment of attachments) {
          record.attachments.push(cloneAttachment(attachment));
        }
      }

      db.expenses.set(id, record);
      return cloneExpense(record.expense);
    },
    updateStatus: (id, status) => {
      const record = db.expenses.get(id);
      if (!record) {
        return null;
      }
      if (record.expense.status === status) {
        return cloneExpense(record.expense);
      }
      record.expense = {
        ...record.expense,
        status,
        updatedAt: new Date().toISOString()
      };
      db.expenses.set(id, record);
      return cloneExpense(record.expense);
    },
    aggregateByCategory: (filters: ExpenseAggregationFilters) => {
      const normalizedSearch = normalizeSearch(filters.search);
      const normalizedFilters: ExpenseFilters = {
        ...filters,
        ...(normalizedSearch !== undefined ? { search: normalizedSearch } : {})
      };
      const statuses = filters.statuses?.length ? new Set(filters.statuses) : undefined;
      const totals = new Map<string, bigint>();

      for (const id of db.order) {
        const record = db.expenses.get(id);
        if (!record) {
          continue;
        }
        if (!matchesFilters(record.expense, normalizedFilters, statuses)) {
          continue;
        }
        const key = record.expense.category.toLowerCase();
        const current = totals.get(key) ?? 0n;
        totals.set(key, current + amountToCents(record.expense.amount));
      }

      const rows: ExpenseAggregationRow[] = [];
      for (const [category, totalCents] of totals.entries()) {
        rows.push({ category, totalCents });
      }
      return rows;
    }
  } satisfies ExpenseEntityRepository;
}

function createIdempotencyRepository(db: FinanceDbState): ExpenseIdempotencyRepository {
  return {
    get: (key) => db.idempotency.get(key) ?? null,
    set: (key, expenseId) => {
      db.idempotency.set(key, expenseId);
    }
  } satisfies ExpenseIdempotencyRepository;
}

function createCache(db: FinanceDbState): ExpenseStoreCache {
  return {
    get: (key) => {
      const entry = db.cache.get(key);
      if (!entry) {
        return undefined;
      }
      if (entry.expiresAt <= Date.now()) {
        db.cache.delete(key);
        return undefined;
      }
      return entry.value as never;
    },
    set: (key, value, ttlMs) => {
      db.cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
      });
    }
  } satisfies ExpenseStoreCache;
}

export function createDbExpenseStoreDependencies(): DbExpenseStoreDependencies {
  const db = getFinanceDb();
  return {
    expenses: createExpenseRepository(db),
    idempotency: createIdempotencyRepository(db),
    cache: createCache(db)
  };
}

export function resetFinanceDb(): void {
  globalScope.__collabverseFinanceDb__ = {
    expenses: new Map(),
    order: [],
    idempotency: new Map(),
    cache: new Map()
  };
}
