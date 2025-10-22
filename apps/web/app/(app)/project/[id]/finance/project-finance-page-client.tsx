'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { formatMoney, parseAmountInput } from '@/lib/finance/format-money';
import { useCurrency } from '@/lib/finance/useCurrency';

type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'payable' | 'closed';

type FinanceRole = 'owner' | 'admin' | 'member' | 'viewer';

type ExpenseAttachment = { filename: string; url: string };

type Expense = {
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

type ExpensesResponse = {
  items: Expense[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

type FinanceFilters = {
  status?: ExpenseStatus;
  category?: string;
  vendor?: string;
  q?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
  tab: 'list' | 'charts';
};

const DEFAULT_FILTERS: FinanceFilters = {
  page: 1,
  pageSize: 20,
  tab: 'list'
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Черновик',
  pending: 'На проверке',
  approved: 'Подтверждено',
  payable: 'К выплате',
  closed: 'Закрыто'
};

const STATUS_COLORS: Record<ExpenseStatus, string> = {
  draft: 'bg-neutral-700 text-neutral-100',
  pending: 'bg-amber-500/20 text-amber-200',
  approved: 'bg-emerald-500/20 text-emerald-200',
  payable: 'bg-indigo-500/20 text-indigo-200',
  closed: 'bg-neutral-600/50 text-neutral-100'
};

const STATUS_NEXT: Record<ExpenseStatus, ExpenseStatus | null> = {
  draft: 'pending',
  pending: 'approved',
  approved: 'payable',
  payable: 'closed',
  closed: null
};

type DrawerState = {
  open: boolean;
  expense: Expense | null;
  draft: Partial<Expense> & { attachments?: ExpenseAttachment[] };
  saving: boolean;
  error: string | null;
  tab: 'details' | 'attachments' | 'history';
  history: AuditEvent[];
  loadingHistory: boolean;
};

type DrawerAction =
  | { type: 'open-create'; payload: { currency: string } }
  | { type: 'open-view'; payload: { expense: Expense } }
  | { type: 'close' }
  | { type: 'update'; payload: Partial<DrawerState['draft']> }
  | { type: 'set-saving'; payload: boolean }
  | { type: 'set-error'; payload: string | null }
  | { type: 'switch-tab'; payload: DrawerState['tab'] }
  | { type: 'set-history'; payload: { items: AuditEvent[]; loading: boolean } };

type AuditEvent = {
  id: string;
  action: string;
  actorId: string;
  createdAt: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEMO_WORKSPACE_ID = 'ws-demo';

function createDraft(expense: Expense | null, currency: string): DrawerState['draft'] {
  if (!expense) {
    return {
      date: new Date().toISOString().slice(0, 10),
      amount: '0',
      currency,
      status: 'draft',
      attachments: []
    };
  }
  const draft: DrawerState['draft'] = {
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

function drawerReducer(state: DrawerState, action: DrawerAction): DrawerState {
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

function parseFilters(search: URLSearchParams): FinanceFilters {
  const filters: FinanceFilters = { ...DEFAULT_FILTERS };
  const status = search.get('status');
  const page = Number(search.get('page') ?? '1');
  const pageSize = Number(search.get('pageSize') ?? `${DEFAULT_FILTERS.pageSize}`);
  const tab = search.get('tab');
  const category = search.get('category');
  const vendor = search.get('vendor');
  const q = search.get('q');
  const dateFrom = search.get('dateFrom');
  const dateTo = search.get('dateTo');

  if (status && (Object.keys(STATUS_LABELS) as ExpenseStatus[]).includes(status as ExpenseStatus)) {
    filters.status = status as ExpenseStatus;
  }
  if (page > 0) {
    filters.page = page;
  }
  if (PAGE_SIZE_OPTIONS.includes(pageSize)) {
    filters.pageSize = pageSize;
  }
  if (tab === 'charts') {
    filters.tab = 'charts';
  }
  if (category) {
    filters.category = category;
  }
  if (vendor) {
    filters.vendor = vendor;
  }
  if (q) {
    filters.q = q;
  }
  if (dateFrom) {
    filters.dateFrom = dateFrom;
  }
  if (dateTo) {
    filters.dateTo = dateTo;
  }
  return filters;
}

function buildParams(current: URLSearchParams, patch: Partial<FinanceFilters>): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  const stringFields: Array<keyof FinanceFilters> = ['status', 'category', 'vendor', 'q', 'dateFrom', 'dateTo'];
  for (const field of stringFields) {
    const value = patch[field];
    if (typeof value === 'string') {
      if (value) {
        params.set(field, value);
      } else {
        params.delete(field);
      }
    }
  }
  if (patch.page !== undefined) {
    params.set('page', `${patch.page}`);
  }
  if (patch.pageSize !== undefined) {
    params.set('pageSize', `${patch.pageSize}`);
  }
  if (patch.tab) {
    params.set('tab', patch.tab);
  }
  if (patch.tab === undefined) {
    params.delete('tab');
  }
  return params;
}

function mapDemoRole(role: string | null): FinanceRole {
  if (role === 'admin') {
    return 'owner';
  }
  if (role === 'user') {
    return 'member';
  }
  return 'viewer';
}

type ProjectFinancePageClientProps = {
  projectId: string;
  searchParams: Record<string, string | string[] | undefined>;
};

export default function ProjectFinancePageClient({ projectId, searchParams }: ProjectFinancePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const [filters, setFilters] = useState<FinanceFilters>(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value !== undefined) {
        params.set(key, value);
      }
    });
    return parseFilters(params);
  });
  const [items, setItems] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState({ page: filters.page, pageSize: filters.pageSize, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<FinanceRole>('viewer');
  const { currency, locale } = useCurrency(projectId);
  const [exporting, setExporting] = useState(false);

  const [drawerState, dispatchDrawer] = useReducer(drawerReducer, {
    open: false,
    expense: null,
    draft: createDraft(null, currency),
    saving: false,
    error: null,
    tab: 'details',
    history: [],
    loadingHistory: false
  });

  useEffect(() => {
    setFilters(parseFilters(liveSearchParams));
  }, [liveSearchParams]);

  const queryKey = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', `${filters.page}`);
    params.set('pageSize', `${filters.pageSize}`);
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.vendor) params.set('vendor', filters.vendor);
    if (filters.q) params.set('q', filters.q);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    async function loadRole() {
      try {
        const response = await fetch('/api/auth/me', { headers: { 'cache-control': 'no-store' } });
        const payload = (await response.json()) as { authenticated?: boolean; email?: string; role?: string };
        if (cancelled) return;
        if (payload.authenticated) {
          setRole(mapDemoRole(payload.role ?? null));
        }
      } catch (error) {
        console.error(error);
      }
    }
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadExpenses() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}/expenses?${queryKey}`, {
          signal: controller.signal,
          headers: { 'cache-control': 'no-store' }
        });
        if (!response.ok) {
          if (response.status === 403) {
            setRole('viewer');
          }
          throw new Error('FAILED');
        }
        const payload = (await response.json()) as ExpensesResponse;
        if (controller.signal.aborted) {
          return;
        }
        setItems(payload.items ?? []);
        setPagination(payload.pagination ?? { page: filters.page, pageSize: filters.pageSize, total: payload.items.length, totalPages: 1 });
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('Не удалось загрузить расходы');
          setItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void loadExpenses();
    return () => controller.abort();
  }, [projectId, queryKey, filters.page, filters.pageSize]);

  const totalAmount = useMemo(() => items.reduce((acc, item) => acc + Number(item.amount ?? 0), 0), [items]);

  const categories = useMemo(() => {
    const values = new Map<string, number>();
    items.forEach((item) => {
      const key = item.category || 'Без категории';
      values.set(key, (values.get(key) ?? 0) + Number(item.amount ?? 0));
    });
    return Array.from(values.entries());
  }, [items]);

  const vendors = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.vendor) list.add(item.vendor);
    });
    return Array.from(list.values());
  }, [items]);

  const burnSeries = useMemo(() => {
    const map = new Map<string, number>();
    items
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((item) => {
        const key = item.date.slice(0, 10);
        map.set(key, (map.get(key) ?? 0) + Number(item.amount ?? 0));
      });
    let acc = 0;
    return Array.from(map.entries()).map(([date, amount]) => {
      acc += amount;
      return { date, amount, total: acc };
    });
  }, [items]);

  const updateQuery = useCallback(
    (patch: Partial<FinanceFilters>) => {
      const params = buildParams(liveSearchParams, patch);
      router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`);
    },
    [liveSearchParams, pathname, router]
  );

  const handleFilter = useCallback(
    (patch: Partial<FinanceFilters>) => {
      updateQuery({ ...patch, page: 1 });
    },
    [updateQuery]
  );

  const handlePagination = useCallback(
    (page: number) => {
      updateQuery({ page });
    },
    [updateQuery]
  );

  const openCreate = useCallback(() => {
    if (role === 'viewer') return;
    dispatchDrawer({ type: 'open-create', payload: { currency } });
  }, [currency, role]);

  const openExpense = useCallback(
    (expense: Expense) => {
      if (role === 'viewer') return;
      dispatchDrawer({ type: 'open-view', payload: { expense } });
    },
    [role]
  );

  const closeDrawer = useCallback(() => dispatchDrawer({ type: 'close' }), []);

  const handleDraftChange = useCallback((patch: Partial<DrawerState['draft']>) => {
    dispatchDrawer({ type: 'update', payload: patch });
  }, []);

  const handleSave = useCallback(async () => {
    if (role === 'viewer') return;
    dispatchDrawer({ type: 'set-saving', payload: true });
    dispatchDrawer({ type: 'set-error', payload: null });
    const payload = {
      workspaceId: drawerState.draft.workspaceId ?? DEMO_WORKSPACE_ID,
      projectId,
      date: drawerState.draft.date,
      amount: parseAmountInput(String(drawerState.draft.amount ?? '0')),
      currency: drawerState.draft.currency ?? currency,
      category: drawerState.draft.category ?? 'Uncategorized',
      description: drawerState.draft.description,
      vendor: drawerState.draft.vendor,
      paymentMethod: drawerState.draft.paymentMethod,
      taxAmount: drawerState.draft.taxAmount,
      status: drawerState.draft.status ?? 'draft',
      attachments: drawerState.draft.attachments ?? []
    };
    try {
      const endpoint = drawerState.expense ? `/api/expenses/${drawerState.expense.id}` : '/api/expenses';
      const method = drawerState.expense ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('SAVE_ERROR');
      }
      closeDrawer();
      updateQuery({ page: filters.page });
    } catch (error) {
      console.error(error);
      dispatchDrawer({ type: 'set-error', payload: 'Не удалось сохранить трату' });
    } finally {
      dispatchDrawer({ type: 'set-saving', payload: false });
    }
  }, [closeDrawer, currency, drawerState.draft, drawerState.expense, filters.page, projectId, role, updateQuery]);

  const handleStatusChange = useCallback(
    async (status: ExpenseStatus) => {
      if (!drawerState.expense || role === 'viewer') return;
      dispatchDrawer({ type: 'set-saving', payload: true });
      dispatchDrawer({ type: 'set-error', payload: null });
      try {
        const response = await fetch(`/api/expenses/${drawerState.expense.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (!response.ok) {
          throw new Error('STATUS_ERROR');
        }
        closeDrawer();
        updateQuery({ page: filters.page });
      } catch (error) {
        console.error(error);
        dispatchDrawer({ type: 'set-error', payload: 'Не удалось сменить статус' });
      } finally {
        dispatchDrawer({ type: 'set-saving', payload: false });
      }
    },
    [closeDrawer, drawerState.expense, filters.page, role, updateQuery]
  );

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(queryKey);
      params.set('page', '1');
      params.set('pageSize', '200');
      const response = await fetch(`/api/projects/${projectId}/expenses?${params.toString()}`, {
        headers: { 'cache-control': 'no-store' }
      });
      if (!response.ok) {
        throw new Error('EXPORT_ERROR');
      }
      const payload = (await response.json()) as ExpensesResponse;
      const rows = (payload.items ?? []).map((expense) => ({
        date: expense.date.slice(0, 10),
        category: expense.category,
        description: expense.description ?? '',
        amount: expense.amount,
        currency: expense.currency,
        vendor: expense.vendor ?? '',
        status: STATUS_LABELS[expense.status]
      }));
      if (!rows.length) {
        alert('Нет данных для экспорта');
        return;
      }
      const [firstRow, ...restRows] = rows;
      const header = Object.keys((firstRow ?? {}) as Record<string, string>);
      const dataRows = [firstRow, ...restRows].filter(Boolean) as typeof rows;
      const lines = dataRows.map((row) =>
        header
          .map((key) => {
            const value = String(row[key as keyof typeof row] ?? '');
            return /["\n,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(',')
      );
      const content = [header.join(','), ...lines].join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(
        now.getHours()
      ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      link.href = url;
      link.download = `project-${projectId}-expenses-${stamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Не удалось экспортировать CSV');
    } finally {
      setExporting(false);
    }
  }, [projectId, queryKey]);

  const loadHistory = useCallback(
    async (expenseId: string) => {
      dispatchDrawer({ type: 'set-history', payload: { items: drawerState.history, loading: true } });
      try {
        const response = await fetch(`/api/expenses/${expenseId}/history`, { headers: { 'cache-control': 'no-store' } });
        if (!response.ok) {
          throw new Error('HISTORY_ERROR');
        }
        const payload = (await response.json()) as { items: AuditEvent[] };
        dispatchDrawer({ type: 'set-history', payload: { items: payload.items ?? [], loading: false } });
      } catch (error) {
        console.error(error);
        dispatchDrawer({ type: 'set-history', payload: { items: [], loading: false } });
      }
    },
    [drawerState.history]
  );

  useEffect(() => {
    if (drawerState.open && drawerState.expense && drawerState.tab === 'history' && !drawerState.history.length) {
      void loadHistory(drawerState.expense.id);
    }
  }, [drawerState.open, drawerState.expense, drawerState.tab, drawerState.history.length, loadHistory]);

  return (
    <ProjectPageFrame
      slug="finance"
      title="Финансы проекта"
      description="Контроль расходов, статусов и визуализация burn-rate."
      actions={
        <>
          <button
            type="button"
            onClick={openCreate}
            disabled={role === 'viewer'}
            className={cn(
              'inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition',
              role === 'viewer' ? 'opacity-40' : 'hover:bg-indigo-400'
            )}
          >
            <span className="text-base leading-none">＋</span> Новая трата
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
          >
            {exporting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
            ) : (
              <span className="text-base leading-none">⬇</span>
            )}{' '}
            CSV
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-500"
            title="TODO: Подключить экспорт XLSX на этапе F2"
          >
            XLSX
          </button>
        </>
      }
      filters={
        <FinanceFiltersPanel
          filters={filters}
          onChange={handleFilter}
          categories={categories.map(([name]) => name)}
          vendors={vendors}
        />
      }
      contentClassName="space-y-6"
    >
      <FinanceTabs current={filters.tab} onChange={(tab) => updateQuery({ tab })} />
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-400">
        <span>{`${pagination.total} записей`}</span>
        <span className="font-semibold text-white">{formatMoney(totalAmount, currency, locale)}</span>
      </div>
      {filters.tab === 'list' ? (
        <FinanceTable
          items={items}
          loading={loading}
          error={error}
          onRetry={() => updateQuery({ page: filters.page })}
          onOpen={openExpense}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          onPageChange={handlePagination}
          onPageSizeChange={(size) => updateQuery({ pageSize: size, page: 1 })}
        />
      ) : (
        <FinanceCharts categories={categories} burnSeries={burnSeries} currency={currency} locale={locale} loading={loading} />
      )}
      <FinanceDrawer
        state={drawerState}
        onClose={closeDrawer}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        onStatusChange={handleStatusChange}
        onTabChange={(tab) => dispatchDrawer({ type: 'switch-tab', payload: tab })}
        role={role}
      />
    </ProjectPageFrame>
  );
}

function FinanceTabs({ current, onChange }: { current: 'list' | 'charts'; onChange: (tab: 'list' | 'charts') => void }) {
  const tabs: Array<{ id: 'list' | 'charts'; label: string; icon: string }> = [
    { id: 'list', label: 'Список', icon: '📋' },
    { id: 'charts', label: 'Графики', icon: '📊' }
  ];
  return (
    <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-900/70 p-1 text-sm">
      {tabs.map((tab) => {
        const active = current === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 transition',
              active ? 'bg-indigo-500 text-white' : 'text-neutral-400 hover:text-white'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function FinanceFiltersPanel({
  filters,
  onChange,
  categories,
  vendors
}: {
  filters: FinanceFilters;
  onChange: (patch: Partial<FinanceFilters>) => void;
  categories: string[];
  vendors: string[];
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Период с
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(event) => onChange({ dateFrom: event.target.value } as Partial<FinanceFilters>)}
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        По
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(event) => onChange({ dateTo: event.target.value } as Partial<FinanceFilters>)}
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Категория
        <select
          value={filters.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value } as Partial<FinanceFilters>)}
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="">Все</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Поставщик
        <select
          value={filters.vendor ?? ''}
          onChange={(event) => onChange({ vendor: event.target.value } as Partial<FinanceFilters>)}
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="">Все</option>
          {vendors.map((vendor) => (
            <option key={vendor} value={vendor}>
              {vendor}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Статус
        <select
          value={filters.status ?? ''}
          onChange={(event) =>
            onChange(
              event.target.value
                ? ({ status: event.target.value as ExpenseStatus } as Partial<FinanceFilters>)
                : ({ status: '' as unknown as ExpenseStatus } as Partial<FinanceFilters>)
            )
          }
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        >
          <option value="">Все</option>
          {(Object.keys(STATUS_LABELS) as ExpenseStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-400">
        Поиск
        <input
          type="search"
          value={filters.q ?? ''}
          onChange={(event) => onChange({ q: event.target.value } as Partial<FinanceFilters>)}
          placeholder="Описание, поставщик..."
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
        />
      </label>
    </>
  );
}

function FinanceTable({
  items,
  loading,
  error,
  onRetry,
  onOpen,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange
}: {
  items: Expense[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (expense: Expense) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-neutral-900 bg-neutral-950/60">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-300">
        <p>{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-300">
        <p>Здесь пока нет расходов. Нажмите «Новая трата» или импортируйте CSV.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-950/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-900 text-sm">
          <thead className="bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left">Дата</th>
              <th className="px-4 py-3 text-left">Категория</th>
              <th className="px-4 py-3 text-left">Описание</th>
              <th className="px-4 py-3 text-left">Сумма</th>
              <th className="px-4 py-3 text-left">Поставщик</th>
              <th className="px-4 py-3 text-left">Статус</th>
              <th className="px-4 py-3 text-left">Вложения</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 text-sm text-neutral-300">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-neutral-900/60">
                <td className="px-4 py-3 align-top text-sm text-neutral-100">
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3 align-top text-sm text-neutral-100">{item.category || 'Без категории'}</td>
                <td className="px-4 py-3 align-top text-sm text-neutral-300">{item.description ?? '—'}</td>
                <td className="px-4 py-3 align-top text-sm text-neutral-100">
                  {formatMoney(item.amount, item.currency, 'ru-RU')}
                </td>
                <td className="px-4 py-3 align-top text-sm text-neutral-300">{item.vendor ?? '—'}</td>
                <td className="px-4 py-3 align-top">
                  <Badge className={cn('px-2 py-1 text-xs', STATUS_COLORS[item.status])}>{STATUS_LABELS[item.status]}</Badge>
                </td>
                <td className="px-4 py-3 align-top text-sm text-neutral-300">
                  {(item.attachments ?? []).length ? `${item.attachments?.length} файл(ов)` : '—'}
                </td>
                <td className="px-4 py-3 align-top text-right text-sm">
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
                  >
                    Открыть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900 bg-neutral-950/80 px-4 py-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          {PAGE_SIZE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onPageSizeChange(option)}
              className={cn(
                'rounded-full px-3 py-1 transition',
                option === pageSize ? 'bg-indigo-500/80 text-white' : 'hover:text-white'
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-full border border-neutral-800 px-3 py-1 text-neutral-300 disabled:opacity-40"
          >
            Назад
          </button>
          <span>
            Стр. {page} из {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-full border border-neutral-800 px-3 py-1 text-neutral-300 disabled:opacity-40"
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}

function FinanceCharts({
  categories,
  burnSeries,
  currency,
  locale,
  loading
}: {
  categories: Array<[string, number]>;
  burnSeries: Array<{ date: string; amount: number; total: number }>;
  currency: string;
  locale: string;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-neutral-900 bg-neutral-950/60">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
      </div>
    );
  }

  if (!categories.length && !burnSeries.length) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-300">
        Нет данных для построения графиков.
      </div>
    );
  }

  const total = categories.reduce((acc, [, amount]) => acc + amount, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Категории</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Доли по категориям</h3>
          </div>
          <span className="text-xl" role="img" aria-label="Категории">
            🍩
          </span>
        </div>
        <div className="mt-6 flex items-center gap-6">
          <div
            className="relative h-32 w-32 shrink-0 rounded-full"
            style={{
              background: categories.length
                ? `conic-gradient(${categories
                    .map(([name, amount], index) => {
                      const palette = ['#6366f1', '#f97316', '#22d3ee', '#a855f7', '#f43f5e', '#14b8a6'];
                      const color = palette[index % palette.length];
                      const start = categories
                        .slice(0, index)
                        .reduce((acc, [, value]) => acc + value / total, 0);
                      const end = start + amount / total;
                      return `${color} ${start * 100}% ${(end * 100).toFixed(2)}%`;
                    })
                    .join(', ')})`
                : undefined
            }}
          />
          <div className="flex-1 space-y-3">
            {categories.map(([name, amount], index) => {
              const palette = ['#6366f1', '#f97316', '#22d3ee', '#a855f7', '#f43f5e', '#14b8a6'];
              const color = palette[index % palette.length];
              const percent = total ? Math.round((amount / total) * 1000) / 10 : 0;
              return (
                <div key={name} className="flex items-center justify-between gap-4 text-sm text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                    <span>{name}</span>
                  </div>
                  <span className="text-neutral-100">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Burn-rate</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Накопленный расход</h3>
          </div>
          <span className="text-xl" role="img" aria-label="Burn rate">
            🔥
          </span>
        </div>
        <div className="mt-6 space-y-3">
          {burnSeries.map((point) => (
            <div key={point.date} className="flex items-center justify-between text-sm text-neutral-300">
              <span>{new Date(point.date).toLocaleDateString('ru-RU')}</span>
              <div className="flex items-center gap-3">
                <span className="text-neutral-100">{formatMoney(point.amount, currency, locale)}</span>
                <span className="text-xs text-neutral-500">{formatMoney(point.total, currency, locale)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceDrawer({
  state,
  onClose,
  onDraftChange,
  onSave,
  onStatusChange,
  onTabChange,
  role
}: {
  state: DrawerState;
  onClose: () => void;
  onDraftChange: (patch: Partial<DrawerState['draft']>) => void;
  onSave: () => void;
  onStatusChange: (status: ExpenseStatus) => void;
  onTabChange: (tab: DrawerState['tab']) => void;
  role: FinanceRole;
}) {
  const nextStatus = state.draft.status ? STATUS_NEXT[state.draft.status] : null;
  const canTransition = role !== 'viewer' && nextStatus;

  return (
    <Sheet open={state.open} onOpenChange={(open) => (open ? null : onClose())}>
      <SheetContent side="right" className="flex h-full flex-col bg-neutral-950/95">
        <SheetHeader className="space-y-2">
          <SheetTitle>{state.expense ? 'Карточка траты' : 'Новая трата'}</SheetTitle>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border border-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:text-white"
          >
            ×
          </button>
        </SheetHeader>
        <div className="mt-4 flex gap-2 text-sm text-neutral-400">
          {(['details', 'attachments', 'history'] as DrawerState['tab'][]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                'rounded-full px-3 py-1 text-xs transition',
                state.tab === tab ? 'bg-indigo-500 text-white' : 'hover:text-white'
              )}
            >
              {tab === 'details' ? 'Детали' : tab === 'attachments' ? 'Вложения' : 'История'}
            </button>
          ))}
        </div>
        <div className="mt-4 flex-1 overflow-y-auto pr-3 text-sm text-neutral-200">
          {state.tab === 'details' ? (
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Дата
                <input
                  type="date"
                  value={state.draft.date ?? ''}
                  onChange={(event) => onDraftChange({ date: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Сумма
                <input
                  type="number"
                  step="0.01"
                  value={state.draft.amount ?? '0'}
                  onChange={(event) => onDraftChange({ amount: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Валюта
                <input
                  type="text"
                  value={state.draft.currency ?? 'RUB'}
                  onChange={(event) => onDraftChange({ currency: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Категория
                <input
                  type="text"
                  value={state.draft.category ?? ''}
                  onChange={(event) => onDraftChange({ category: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Описание
                <textarea
                  value={state.draft.description ?? ''}
                  onChange={(event) => onDraftChange({ description: event.target.value })}
                  className="min-h-[72px] rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Поставщик
                <input
                  type="text"
                  value={state.draft.vendor ?? ''}
                  onChange={(event) => onDraftChange({ vendor: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Метод оплаты
                <input
                  type="text"
                  value={state.draft.paymentMethod ?? ''}
                  onChange={(event) => onDraftChange({ paymentMethod: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Налоги
                <input
                  type="number"
                  step="0.01"
                  value={state.draft.taxAmount ?? ''}
                  onChange={(event) => onDraftChange({ taxAmount: event.target.value })}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
                />
              </label>
            </div>
          ) : null}
          {state.tab === 'attachments' ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-400">
                Перетащите файлы в область ниже или добавьте ссылку вручную. Хранение файлов реализуется на этапе F2.
              </p>
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt('Название файла');
                  if (!name) return;
                  const url = window.prompt('Ссылка на файл (URL)');
                  if (!url) return;
                  const next = [...(state.draft.attachments ?? []), { filename: name, url }];
                  onDraftChange({ attachments: next });
                }}
                className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-100"
              >
                Добавить ссылку
              </button>
              <div className="space-y-2">
                {(state.draft.attachments ?? []).map((file, index) => (
                  <div
                    key={`${file.filename}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2"
                  >
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-sm text-neutral-100 hover:text-indigo-300">
                      {file.filename}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...(state.draft.attachments ?? [])];
                        next.splice(index, 1);
                        onDraftChange({ attachments: next });
                      }}
                      className="rounded-full border border-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:text-white"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {state.tab === 'history' ? (
            <div className="space-y-3 text-sm text-neutral-300">
              {state.loadingHistory ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              ) : state.history.length ? (
                state.history.map((event) => (
                  <div key={event.id} className="rounded-xl border border-neutral-900 bg-neutral-900/50 px-3 py-2">
                    <p className="text-xs text-neutral-500">
                      {new Date(event.createdAt).toLocaleString('ru-RU')} — {event.actorId}
                    </p>
                    <p className="mt-1 text-sm text-neutral-100">{event.action}</p>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500">История событий появится после действий с тратой.</p>
              )}
            </div>
          ) : null}
        </div>
        {state.error ? <p className="mt-2 text-sm text-rose-400">{state.error}</p> : null}
        <div className="mt-4 flex flex-col gap-2 border-t border-neutral-900 pt-4">
          <button
            type="button"
            onClick={onSave}
            disabled={role === 'viewer' || state.saving}
            className={cn(
              'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition',
              role === 'viewer' ? 'opacity-40' : 'hover:bg-indigo-400'
            )}
          >
            {state.saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          {canTransition ? (
            <button
              type="button"
              onClick={() => onStatusChange(nextStatus!)}
              disabled={state.saving}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
            >
              Перевести в «{STATUS_LABELS[nextStatus!]}»
            </button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

