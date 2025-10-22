import { memory } from '../data/memory';
import { auditLogRepository } from '../repositories/audit-log-repository';
import { domainEventsRepository } from '../repositories/domain-events-repository';
import { expensesRepository, type ExpenseFilters } from '../repositories/expenses-repository';
import { projectBudgetsRepository } from '../repositories/project-budgets-repository';
import type {
  AuditLogEntry,
  Expense,
  ExpenseAttachment,
  ExpenseStatus,
  ProjectBudget,
  ProjectBudgetCategoryLimit,
  ProjectBudgetSnapshot,
  ProjectBudgetUsageCategory
} from '../types';
import { amountToCents, centsToAmount, normalizeAmount, normalizeCurrency } from '../utils/money';

const ALLOWED_STATUS: ExpenseStatus[] = ['draft', 'pending', 'approved', 'payable', 'closed'];
const FINAL_STATUSES = new Set<ExpenseStatus>(['approved', 'payable', 'closed']);
const STATUS_FLOW: Record<ExpenseStatus, ExpenseStatus[]> = {
  draft: ['pending'],
  pending: ['approved', 'draft'],
  approved: ['payable', 'pending'],
  payable: ['closed', 'approved'],
  closed: []
};

function assertStatusTransition(from: ExpenseStatus, to: ExpenseStatus): void {
  if (from === to) {
    return;
  }
  const allowed = STATUS_FLOW[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error('INVALID_STATUS_TRANSITION');
  }
}

function assertValidStatus(status: ExpenseStatus): void {
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error('INVALID_STATUS');
  }
}

function assertDate(value: unknown): string {
  if (typeof value !== 'string' || !value) {
    throw new Error('INVALID_DATE');
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('INVALID_DATE');
  }
  const now = new Date();
  const limit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (parsed.getTime() > limit.getTime()) {
    throw new Error('INVALID_DATE');
  }
  return new Date(parsed.toISOString()).toISOString();
}

function assertWarnThreshold(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 1) {
    throw new Error('INVALID_WARN_THRESHOLD');
  }
  return num;
}

export interface CreateExpenseInput {
  workspaceId: string;
  projectId: string;
  taskId?: string;
  date: string;
  amount: unknown;
  currency: unknown;
  category: string;
  description?: string;
  vendor?: string;
  paymentMethod?: string;
  taxAmount?: unknown;
  attachments?: { filename: string; url: string }[];
  status?: ExpenseStatus;
}

export interface UpdateExpenseInput {
  taskId?: string;
  date?: string;
  amount?: unknown;
  currency?: unknown;
  category?: string;
  description?: string;
  vendor?: string;
  paymentMethod?: string;
  taxAmount?: unknown;
  status?: ExpenseStatus;
  attachments?: { filename: string; url: string }[];
}

export interface CreateBudgetInput {
  currency: unknown;
  total?: unknown;
  warnThreshold?: unknown;
  categories?: { name: string; limit?: unknown }[];
}

export interface FinanceListResult {
  items: Expense[];
  total: number;
}

interface OperationContext {
  actorId: string;
  idempotencyKey?: string | null;
}

function ensurePositive(amount: string): void {
  if (amountToCents(amount) <= 0n) {
    throw new Error('AMOUNT_NOT_POSITIVE');
  }
}

function normalizeTaxAmount(value: unknown): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const normalized = normalizeAmount(value);
  if (amountToCents(normalized) < 0n) {
    throw new Error('INVALID_TAX');
  }
  return normalized;
}

function buildCategoriesUsage(
  categories: ProjectBudget['categories'],
  spentPerCategory: Map<string, bigint>
): ProjectBudgetUsageCategory[] {
  if (!categories?.length) {
    return Array.from(spentPerCategory.entries()).map(([name, amount]) => ({
      name,
      spent: centsToAmount(amount)
    }));
  }
  return categories.map((category) => {
    const key = category.name.toLowerCase();
    const spent = spentPerCategory.get(key) ?? 0n;
    return {
      ...category,
      spent: centsToAmount(spent)
    };
  });
}

function createAuditEntry(params: {
  actorId: string;
  action: string;
  projectId?: string;
  workspaceId?: string;
  entity: { type: string; id: string };
  before?: unknown;
  after?: unknown;
}): void {
  const entry: AuditLogEntry = {
    id: crypto.randomUUID(),
    actorId: params.actorId,
    action: params.action,
    entity: params.entity,
    createdAt: new Date().toISOString()
  };

  if (params.projectId) {
    entry.projectId = params.projectId;
  }
  if (params.workspaceId) {
    entry.workspaceId = params.workspaceId;
  }
  if (params.before !== undefined) {
    entry.before = params.before;
  }
  if (params.after !== undefined) {
    entry.after = params.after;
  }

  auditLogRepository.record(entry);
}

function emitEvent<T>(type: string, entityId: string, payload: T): void {
  domainEventsRepository.emit({
    id: crypto.randomUUID(),
    type,
    entityId,
    payload,
    createdAt: new Date().toISOString()
  });
}

function ensureBudgetCurrency(budget: ProjectBudget | null, expenseCurrency: string): void {
  if (budget && budget.currency !== expenseCurrency) {
    throw new Error('BUDGET_CURRENCY_MISMATCH');
  }
}

export class FinanceService {
  listExpenses(filters: ExpenseFilters): FinanceListResult {
    const items = expensesRepository.list(filters);
    return { items, total: items.length };
  }

  findExpenseById(id: string): Expense | null {
    return expensesRepository.findById(id);
  }

  createExpense(input: CreateExpenseInput, context: OperationContext): Expense {
    const idempotencyKey = context.idempotencyKey?.trim();
    if (idempotencyKey) {
      const existingId = memory.IDEMPOTENCY_KEYS.get(idempotencyKey);
      if (existingId) {
        const existing = expensesRepository.findById(existingId);
        if (existing) {
          return existing;
        }
      }
    }

    const amount = normalizeAmount(input.amount);
    ensurePositive(amount);
    const taxAmount = normalizeTaxAmount(input.taxAmount);
    const currency = normalizeCurrency(input.currency);
    const status: ExpenseStatus = input.status ?? 'draft';
    assertValidStatus(status);
    const date = assertDate(input.date);

    const budget = projectBudgetsRepository.find(input.projectId);
    ensureBudgetCurrency(budget, currency);

    const now = new Date().toISOString();
    const expense: Expense = {
      id: crypto.randomUUID(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      date,
      amount,
      currency,
      category: input.category,
      status,
      createdBy: context.actorId,
      createdAt: now,
      updatedAt: now
    };

    if (typeof input.taskId === 'string' && input.taskId) {
      expense.taskId = input.taskId;
    }
    if (typeof input.description === 'string') {
      expense.description = input.description;
    }
    if (typeof input.vendor === 'string') {
      expense.vendor = input.vendor;
    }
    if (typeof input.paymentMethod === 'string') {
      expense.paymentMethod = input.paymentMethod;
    }
    if (taxAmount !== null) {
      expense.taxAmount = taxAmount;
    }

    const inserted = expensesRepository.insert(expense);

    if (input.attachments?.length) {
      for (const file of input.attachments) {
        const attachment: ExpenseAttachment = {
          id: crypto.randomUUID(),
          expenseId: inserted.id,
          filename: file.filename,
          url: file.url,
          uploadedAt: now
        };
        expensesRepository.saveAttachment(attachment);
      }
    }

    if (idempotencyKey) {
      memory.IDEMPOTENCY_KEYS.set(idempotencyKey, inserted.id);
    }

    createAuditEntry({
      actorId: context.actorId,
      action: 'expense.created',
      projectId: inserted.projectId,
      workspaceId: inserted.workspaceId,
      entity: { type: 'expense', id: inserted.id },
      after: inserted
    });
    emitEvent('expense.created', inserted.id, inserted);

    this.recalculateBudget(inserted.projectId);

    return inserted;
  }

  updateExpense(id: string, patch: UpdateExpenseInput, context: OperationContext): Expense {
    const current = expensesRepository.findById(id);
    if (!current) {
      throw new Error('EXPENSE_NOT_FOUND');
    }

    const updates: Partial<
      Omit<Expense, 'id' | 'createdAt' | 'createdBy' | 'workspaceId' | 'projectId' | 'taskId' | 'taxAmount'>
    > & {
      taxAmount?: string | null;
      taskId?: string | null;
    } = {};
    let shouldRecalculate = false;

    if (patch.taskId !== undefined) {
      updates.taskId = typeof patch.taskId === 'string' && patch.taskId ? patch.taskId : null;
    }
    if (patch.category !== undefined) {
      updates.category = patch.category;
    }
    if (patch.description !== undefined) {
      updates.description = patch.description;
    }
    if (patch.vendor !== undefined) {
      updates.vendor = patch.vendor;
    }
    if (patch.paymentMethod !== undefined) {
      updates.paymentMethod = patch.paymentMethod;
    }
    if (patch.date !== undefined) {
      updates.date = assertDate(patch.date);
      shouldRecalculate = true;
    }
    if (patch.amount !== undefined) {
      const amount = normalizeAmount(patch.amount);
      ensurePositive(amount);
      updates.amount = amount;
      shouldRecalculate = true;
    }
    if (patch.currency !== undefined) {
      const currency = normalizeCurrency(patch.currency);
      const budget = projectBudgetsRepository.find(current.projectId);
      ensureBudgetCurrency(budget, currency);
      updates.currency = currency;
      shouldRecalculate = true;
    }
    if (patch.taxAmount !== undefined) {
      const taxValue = normalizeTaxAmount(patch.taxAmount);
      updates.taxAmount = taxValue;
      shouldRecalculate = true;
    }

    if (patch.status) {
      assertValidStatus(patch.status);
      assertStatusTransition(current.status, patch.status);
      updates.status = patch.status;
      shouldRecalculate = true;
    }

    const updated = expensesRepository.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      throw new Error('EXPENSE_NOT_FOUND');
    }

    if (patch.attachments?.length) {
      const timestamp = new Date().toISOString();
      for (const file of patch.attachments) {
        const attachment: ExpenseAttachment = {
          id: crypto.randomUUID(),
          expenseId: updated.id,
          filename: file.filename,
          url: file.url,
          uploadedAt: timestamp
        };
        expensesRepository.saveAttachment(attachment);
      }
    }

    createAuditEntry({
      actorId: context.actorId,
      action: patch.status && patch.status !== current.status ? 'expense.status_changed' : 'expense.updated',
      projectId: updated.projectId,
      workspaceId: updated.workspaceId,
      entity: { type: 'expense', id: updated.id },
      before: current,
      after: updated
    });

    if (patch.status && patch.status !== current.status) {
      emitEvent('expense.status_changed', updated.id, { from: current.status, to: patch.status });
    }

    if (shouldRecalculate) {
      this.recalculateBudget(updated.projectId);
    }

    return updated;
  }

  getBudget(projectId: string): ProjectBudgetSnapshot | null {
    const budget = projectBudgetsRepository.find(projectId);
    if (!budget) {
      return null;
    }
    return this.buildSnapshot(budget);
  }

  upsertBudget(projectId: string, input: CreateBudgetInput, context: OperationContext): ProjectBudgetSnapshot {
    const currency = normalizeCurrency(input.currency);
    const total = input.total !== undefined ? normalizeAmount(input.total) : undefined;
    if (total !== undefined) {
      ensurePositive(total);
    }
    const warnThreshold = assertWarnThreshold(input.warnThreshold);

    const categories = input.categories?.map((category) => {
      const item: ProjectBudgetCategoryLimit = { name: category.name };
      if (category.limit !== undefined) {
        item.limit = normalizeAmount(category.limit);
      }
      return item;
    });

    const now = new Date().toISOString();
    const budget: ProjectBudget = {
      projectId,
      currency,
      updatedAt: now
    };

    if (total !== undefined) {
      budget.total = total;
    }
    if (warnThreshold !== undefined) {
      budget.warnThreshold = warnThreshold;
    }
    if (categories) {
      budget.categories = categories;
    }

    const stored = projectBudgetsRepository.upsert(budget);

    createAuditEntry({
      actorId: context.actorId,
      action: 'project_budget.updated',
      projectId,
      entity: { type: 'project_budget', id: projectId },
      after: stored
    });
    emitEvent('project_budget.updated', projectId, stored);

    const snapshot = this.buildSnapshot(stored);
    this.recalculateBudget(projectId);
    return snapshot;
  }

  private buildSnapshot(budget: ProjectBudget): ProjectBudgetSnapshot {
    const expenses = expensesRepository.list({ projectId: budget.projectId });
    const relevant = expenses.filter((expense) => FINAL_STATUSES.has(expense.status));

    let spentTotal = 0n;
    const spentPerCategory = new Map<string, bigint>();

    for (const expense of relevant) {
      const cents = amountToCents(expense.amount);
      spentTotal += cents;
      const key = expense.category.toLowerCase();
      spentPerCategory.set(key, (spentPerCategory.get(key) ?? 0n) + cents);
    }

    const categoriesUsage = buildCategoriesUsage(budget.categories, spentPerCategory);
    const snapshot: ProjectBudgetSnapshot = {
      ...budget,
      spentTotal: centsToAmount(spentTotal),
      categoriesUsage
    };

    if (budget.total !== undefined) {
      snapshot.remainingTotal = centsToAmount(amountToCents(budget.total) - spentTotal);
    }

    return snapshot;
  }

  recalculateBudget(projectId: string): void {
    const budget = projectBudgetsRepository.find(projectId);
    if (!budget) {
      return;
    }

    const snapshot = this.buildSnapshot(budget);
    projectBudgetsRepository.upsert(snapshot);
  }
}

export const financeService = new FinanceService();
