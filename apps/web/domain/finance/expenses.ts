import { formatMoney } from '@/lib/finance/format-money';

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

export function normalizeExpense(raw: Expense): Expense {
  return {
    ...raw,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : []
  };
}

export type ExpensesResponse = {
  items: Expense[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

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

export type ExpenseDraft = Partial<Expense> & { attachments?: ExpenseAttachment[] };

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
