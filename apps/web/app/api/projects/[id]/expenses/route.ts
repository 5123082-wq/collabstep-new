import '@/lib/finance/bootstrap';
import {
  createFinanceService,
  getExpenseStore,
  type ExpenseFilters,
  type ExpenseStatus
} from '@collabverse/api';
import { jsonError, jsonOk } from '@/lib/api/http';
import { getAuthFromRequest, getProjectRole } from '@/lib/api/finance-access';

const financeService = createFinanceService(getExpenseStore());

function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const sizeParam = Number(url.searchParams.get('pageSize') ?? '20');
  const pageSize = Math.min(100, Math.max(1, Number.isFinite(sizeParam) ? sizeParam : 20));
  return { page, pageSize };
}

function applyPagination<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);
  return { items: paginated, pagination: { page, pageSize, total, totalPages } };
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = getAuthFromRequest(request);
  if (!auth) {
    return jsonError('UNAUTHORIZED', { status: 401 });
  }

  const role = getProjectRole(params.id, auth.userId);
  if (role === 'viewer') {
    return jsonError('FORBIDDEN', { status: 403 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') as ExpenseStatus | null;
  const category = url.searchParams.get('category') ?? undefined;
  const dateFrom = url.searchParams.get('dateFrom') ?? undefined;
  const dateTo = url.searchParams.get('dateTo') ?? undefined;
  const search = url.searchParams.get('q') ?? undefined;
  const { page, pageSize } = parsePagination(url);

  const serviceFilters: ExpenseFilters = { projectId: params.id };
  if (status) {
    serviceFilters.status = status;
  }
  if (category) {
    serviceFilters.category = category;
  }
  if (dateFrom) {
    serviceFilters.dateFrom = dateFrom;
  }
  if (dateTo) {
    serviceFilters.dateTo = dateTo;
  }
  if (search) {
    serviceFilters.search = search;
  }

  const { items } = financeService.listExpenses(serviceFilters);

  const filtered = role === 'member' ? items.filter((expense) => expense.createdBy === auth.userId) : items;
  const { items: paginated, pagination } = applyPagination(filtered, page, pageSize);

  return jsonOk({ items: paginated, pagination });
}
