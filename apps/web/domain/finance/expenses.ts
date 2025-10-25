import { formatMoney, parseAmountInput } from '@/lib/finance/format-money';

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'payable' | 'closed';

export type FinanceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type ExpenseAttachment = { filename: string; url: string };

export type Expense = {
  id: string;
  projectId: string;
  workspaceId: string;
  date: string;
  amount: string;
  currency: string;
  category: string;
  description?: string;
  vendor?: string;
  paymentMethod?: string;
  taxAmount?: string;
  status: ExpenseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: ExpenseAttachment[];
};

const STATUS_ORDER: ExpenseStatus[] = ['draft', 'pending', 'approved', 'payable', 'closed'];

function coerceString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }
  return null;
}

function normalizeDate(value: unknown): string {
  const stringValue = coerceString(value);
  if (!stringValue) {
    return new Date().toISOString().slice(0, 10);
  }
  const isoMatch = stringValue.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) {
    return isoMatch[0];
  }
  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeCurrency(value: unknown, fallback = 'RUB'): string {
  const stringValue = coerceString(value);
  if (!stringValue) {
    return fallback;
  }
  const upper = stringValue.toUpperCase();
  return /^[A-Z]{3}$/.test(upper) ? upper : fallback;
}

function normalizeStatus(value: unknown, fallback: ExpenseStatus = 'draft'): ExpenseStatus {
  const stringValue = coerceString(value)?.toLowerCase() ?? null;
  if (!stringValue) {
    return fallback;
  }
  const status = STATUS_ORDER.find((item) => item === stringValue);
  return status ?? fallback;
}

function normalizeAttachments(value: unknown): ExpenseAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => {
      const objectValue = item as Partial<ExpenseAttachment>;
      const filename = coerceString(objectValue?.filename);
      const url = coerceString(objectValue?.url);
      if (!url) {
        return null;
      }
      return {
        filename: filename ?? 'Файл',
        url
      } satisfies ExpenseAttachment;
    })
    .filter((attachment): attachment is ExpenseAttachment => Boolean(attachment));
}

function ensureId(value: unknown, prefix: string): string {
  const normalized = coerceString(value);
  if (normalized) {
    return normalized;
  }
  const fallback = `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  return fallback;
}

function normalizeSummary(
  raw: unknown,
  totalsFallback: number
): ExpenseSummary {
  if (!raw || typeof raw !== 'object') {
    return { totalCount: totalsFallback, totalsByCurrency: [] } satisfies ExpenseSummary;
  }
  const summary = raw as Partial<ExpenseSummary>;
  const totalCount = Number.isFinite(summary?.totalCount)
    ? Number(summary.totalCount)
    : totalsFallback;
  const totalsByCurrency = Array.isArray(summary?.totalsByCurrency)
    ? summary.totalsByCurrency
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null;
          }
          const currency = normalizeCurrency((item as Record<string, unknown>).currency);
          const amountRaw = coerceString((item as Record<string, unknown>).amount) ?? '0';
          return { currency, amount: parseAmountInput(amountRaw) };
        })
        .filter((entry) => Boolean(entry))
    : [];
  return {
    totalCount,
    totalsByCurrency
  } satisfies ExpenseSummary;
}

function normalizePagination(
  raw: unknown,
  defaults: { page: number; pageSize: number },
  totalCount: number
): ExpensesResponse['pagination'] {
  const fallbackTotalPages = Math.max(1, Math.ceil(totalCount / defaults.pageSize));
  if (!raw || typeof raw !== 'object') {
    return {
      page: defaults.page,
      pageSize: defaults.pageSize,
      total: totalCount,
      totalPages: fallbackTotalPages
    } satisfies ExpensesResponse['pagination'];
  }
  const pagination = raw as Partial<ExpensesResponse['pagination']>;
  const page = Number.isFinite(pagination?.page) ? Number(pagination?.page) : defaults.page;
  const pageSize = Number.isFinite(pagination?.pageSize)
    ? Number(pagination?.pageSize)
    : defaults.pageSize;
  const total = Number.isFinite(pagination?.total) ? Number(pagination?.total) : totalCount;
  const totalPages = Number.isFinite(pagination?.totalPages)
    ? Number(pagination?.totalPages)
    : Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  return { page, pageSize, total, totalPages } satisfies ExpensesResponse['pagination'];
}

export function normalizeExpense(raw: unknown): Expense {
  const data = (raw && typeof raw === 'object' ? (raw as Partial<Expense>) : {}) as Record<string, unknown>;
  const id = ensureId(data.id, 'expense');
  const projectId = ensureId(data.projectId, 'project');
  const workspaceId = ensureId(data.workspaceId, 'workspace');
  const category = coerceString(data.category) ?? 'Uncategorized';
  const description = coerceString(data.description) ?? undefined;
  const vendor = coerceString(data.vendor) ?? undefined;
  const paymentMethod = coerceString(data.paymentMethod) ?? undefined;
  const taxAmount = coerceString(data.taxAmount) ?? undefined;
  const createdBy = coerceString(data.createdBy) ?? 'unknown';
  const createdAt = normalizeDate(data.createdAt);
  const updatedAt = normalizeDate(data.updatedAt ?? data.createdAt ?? new Date().toISOString());

  return {
    id,
    projectId,
    workspaceId,
    date: normalizeDate(data.date),
    amount: parseAmountInput(coerceString(data.amount) ?? '0'),
    currency: normalizeCurrency(data.currency),
    category,
    description,
    vendor,
    paymentMethod,
    taxAmount,
    status: normalizeStatus(data.status),
    createdBy,
    createdAt,
    updatedAt,
    attachments: normalizeAttachments(data.attachments)
  } satisfies Expense;
}

export type ExpenseSummary = {
  totalCount: number;
  totalsByCurrency: Array<{ currency: string; amount: string }>;
};

export type ExpensesResponse = {
  items: Expense[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  summary: ExpenseSummary;
};

export function formatAttachmentCount(attachments?: ExpenseAttachment[]): string {
  const count = Array.isArray(attachments) ? attachments.length : 0;
  return count > 0 ? `${count} файл(ов)` : '—';
}

export type AuditEvent = {
  id: string;
  action: string;
  actorId: string;
  createdAt: string;
};

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Черновик',
  pending: 'На проверке',
  approved: 'Подтверждено',
  payable: 'К выплате',
  closed: 'Закрыто'
};

export const STATUS_COLORS: Record<ExpenseStatus, string> = {
  draft: 'bg-neutral-700 text-neutral-100',
  pending: 'bg-amber-500/20 text-amber-200',
  approved: 'bg-emerald-500/20 text-emerald-200',
  payable: 'bg-indigo-500/20 text-indigo-200',
  closed: 'bg-neutral-600/50 text-neutral-100'
};

export const STATUS_NEXT: Record<ExpenseStatus, ExpenseStatus | null> = {
  draft: 'pending',
  pending: 'approved',
  approved: 'payable',
  payable: 'closed',
  closed: null
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEMO_WORKSPACE_ID = 'ws-demo';

export type ExpenseDraft = Omit<Partial<Expense>, 'projectId'> & {
  projectId?: string | null;
  attachments?: ExpenseAttachment[];
};

export type DrawerState = {
  open: boolean;
  expense: Expense | null;
  draft: ExpenseDraft;
  saving: boolean;
  error: string | null;
  tab: 'details' | 'attachments' | 'history';
  history: AuditEvent[];
  loadingHistory: boolean;
};

export type DrawerAction =
  | { type: 'open-create'; payload: { currency: string } }
  | { type: 'open-view'; payload: { expense: Expense } }
  | { type: 'close' }
  | { type: 'update'; payload: Partial<DrawerState['draft']> }
  | { type: 'set-saving'; payload: boolean }
  | { type: 'set-error'; payload: string | null }
  | { type: 'switch-tab'; payload: DrawerState['tab'] }
  | { type: 'set-history'; payload: { items: AuditEvent[]; loading: boolean } };

export function createDraft(expense: Expense | null, currency: string): ExpenseDraft {
  if (!expense) {
    return {
      date: new Date().toISOString().slice(0, 10),
      amount: '0',
      currency,
      status: 'draft',
      attachments: []
    };
  }

  const draft: ExpenseDraft = {
    id: expense.id,
    projectId: expense.projectId,
    workspaceId: expense.workspaceId,
    date: expense.date.slice(0, 10),
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    status: expense.status,
    attachments: expense.attachments ? [...expense.attachments] : []
  };

  if (expense.description !== undefined) {
    draft.description = expense.description;
  }
  if (expense.vendor !== undefined) {
    draft.vendor = expense.vendor;
  }
  if (expense.paymentMethod !== undefined) {
    draft.paymentMethod = expense.paymentMethod;
  }
  if (expense.taxAmount !== undefined) {
    draft.taxAmount = expense.taxAmount;
  }

  return draft;
}

export function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
  switch (action.type) {
    case 'open-create':
      return {
        open: true,
        expense: null,
        draft: createDraft(null, action.payload.currency),
        saving: false,
        error: null,
        tab: 'details',
        history: [],
        loadingHistory: false
      };
    case 'open-view':
      return {
        open: true,
        expense: action.payload.expense,
        draft: createDraft(action.payload.expense, action.payload.expense.currency),
        saving: false,
        error: null,
        tab: 'details',
        history: [],
        loadingHistory: false
      };
    case 'close':
      return {
        open: false,
        expense: null,
        draft: createDraft(null, state.draft.currency ?? 'RUB'),
        saving: false,
        error: null,
        tab: 'details',
        history: [],
        loadingHistory: false
      };
    case 'update':
      return { ...state, draft: { ...state.draft, ...action.payload } };
    case 'set-saving':
      return { ...state, saving: action.payload };
    case 'set-error':
      return { ...state, error: action.payload };
    case 'switch-tab':
      return { ...state, tab: action.payload };
    case 'set-history':
      return { ...state, history: action.payload.items, loadingHistory: action.payload.loading };
    default:
      return state;
  }
}

export function formatExpenseAmount(amount: string, currency: string, locale: string): string {
  return formatMoney(amount, currency, locale);
}

export function normalizeExpensesResponse(
  raw: unknown,
  defaults: { page: number; pageSize: number }
): ExpensesResponse {
  const payload = raw && typeof raw === 'object' ? (raw as Partial<ExpensesResponse>) : {};
  const items = Array.isArray(payload.items)
    ? payload.items
        .map((item) => {
          try {
            return normalizeExpense(item);
          } catch (error) {
            console.error('Failed to normalize expense', error);
            return null;
          }
        })
        .filter((item): item is Expense => Boolean(item))
    : [];
  const summary = normalizeSummary(payload.summary, items.length);
  const pagination = normalizePagination(payload.pagination, defaults, summary.totalCount);
  return {
    items,
    summary,
    pagination
  } satisfies ExpensesResponse;
}
