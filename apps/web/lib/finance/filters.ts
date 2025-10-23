import type { ExpenseStatus } from '@/domain/finance/expenses';

export type ExpenseListFilters = {
  projectId?: string;
  status?: ExpenseStatus;
  category?: string;
  vendor?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
};

export const DEFAULT_EXPENSE_FILTERS: ExpenseListFilters = {
  page: 1,
  pageSize: 20
};

function normalizeStatus(value: string | null): ExpenseStatus | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  const allowed: ExpenseStatus[] = ['draft', 'pending', 'approved', 'payable', 'closed'];
  return allowed.includes(normalized as ExpenseStatus) ? (normalized as ExpenseStatus) : undefined;
}

function toNumber(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

export function parseExpenseFilters(
  searchParams: URLSearchParams,
  defaults: ExpenseListFilters = DEFAULT_EXPENSE_FILTERS
): ExpenseListFilters {
  const page = toNumber(searchParams.get('page'), defaults.page);
  const pageSize = toNumber(searchParams.get('pageSize'), defaults.pageSize);
  const result: ExpenseListFilters = { page, pageSize };

  const projectId = searchParams.get('projectId');
  if (projectId) {
    result.projectId = projectId;
  }

  const status = normalizeStatus(searchParams.get('status'));
  if (status) {
    result.status = status;
  }

  const category = searchParams.get('category');
  if (category) {
    result.category = category;
  }

  const vendor = searchParams.get('vendor');
  if (vendor) {
    result.vendor = vendor;
  }

  const query = searchParams.get('q');
  if (query) {
    result.q = query;
  }

  const dateFrom = searchParams.get('dateFrom');
  if (dateFrom) {
    result.dateFrom = dateFrom;
  }

  const dateTo = searchParams.get('dateTo');
  if (dateTo) {
    result.dateTo = dateTo;
  }

  return result;
}

export function buildExpenseFilterParams(
  current: URLSearchParams,
  patch: Partial<ExpenseListFilters>
): URLSearchParams {
  const next = new URLSearchParams(current.toString());
  const stringFields: Array<keyof ExpenseListFilters> = ['projectId', 'status', 'category', 'vendor', 'q', 'dateFrom', 'dateTo'];
  for (const field of stringFields) {
    const value = patch[field];
    if (value === undefined) {
      continue;
    }
    if (typeof value === 'string' && value.trim() === '') {
      next.delete(field);
    } else if (value) {
      next.set(field, String(value));
    } else {
      next.delete(field);
    }
  }
  if (patch.page !== undefined) {
    next.set('page', `${patch.page}`);
  }
  if (patch.pageSize !== undefined) {
    next.set('pageSize', `${patch.pageSize}`);
  }
  return next;
}
