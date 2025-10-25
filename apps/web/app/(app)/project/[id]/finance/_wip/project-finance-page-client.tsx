'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ExpenseDrawer from '@/components/finance/ExpenseDrawer';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { Badge } from '@/components/ui/badge';
import {
  DEMO_WORKSPACE_ID,
  PAGE_SIZE_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  createDraft,
  drawerReducer,
  normalizeExpensesResponse,
  type AuditEvent,
  type DrawerState,
  type Expense,
  type ExpenseStatus,
  type FinanceRole
} from '@/domain/finance/expenses';
import { cn } from '@/lib/utils';
import { formatMoney, parseAmountInput } from '@/lib/finance/format-money';
import { useCurrency } from '@/lib/finance/useCurrency';
import { getExpensePermissions } from '@/lib/finance/permissions';

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

const FINANCE_ROLES: FinanceRole[] = ['owner', 'admin', 'member', 'viewer'];

const EXPENSES_UPDATED_EVENT = 'finance:expenses-updated';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeFinanceRole(role: string | null): FinanceRole {
  if (!role) {
    return 'viewer';
  }
  const normalized = role.trim().toLowerCase();
  if (normalized === 'user') {
    return 'member';
  }
  if (normalized === 'admin') {
    return 'owner';
  }
  if (FINANCE_ROLES.includes(normalized as FinanceRole)) {
    return normalized as FinanceRole;
  }
  return 'viewer';
}

function normalizeDate(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (ISO_DATE_RE.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed.toISOString().slice(0, 10);
}

function normalizeText(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function broadcastExpensesUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(EXPENSES_UPDATED_EVENT));
}

function parseFilters(search: URLSearchParams): FinanceFilters {
  const filters: FinanceFilters = { ...DEFAULT_FILTERS };
  const status = search.get('status');
  const page = Number(search.get('page') ?? '1');
  const pageSize = Number(search.get('pageSize') ?? `${DEFAULT_FILTERS.pageSize}`);
  const tab = search.get('tab');
  const category = normalizeText(search.get('category'));
  const vendor = normalizeText(search.get('vendor'));
  const q = normalizeText(search.get('q'));
  const dateFrom = normalizeDate(search.get('dateFrom'));
  const dateTo = normalizeDate(search.get('dateTo'));

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
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const { currency, locale } = useCurrency(projectId);
  const [exporting, setExporting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

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

  const basePermissions = useMemo(() => getExpensePermissions(role), [role]);

  const triggerRefresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = () => triggerRefresh();
    window.addEventListener(EXPENSES_UPDATED_EVENT, handler);
    return () => window.removeEventListener(EXPENSES_UPDATED_EVENT, handler);
  }, [triggerRefresh]);

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
          setRole(normalizeFinanceRole(payload.role ?? null));
          setViewerEmail(typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : null);
        } else {
          setRole('viewer');
          setViewerEmail(null);
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
            setViewerEmail(null);
          }
          throw new Error('FAILED');
        }
        const payload = await response.json();
        if (controller.signal.aborted) {
          return;
        }
        const normalized = normalizeExpensesResponse(payload, { page: filters.page, pageSize: filters.pageSize });
        setItems(normalized.items);
        setPagination(normalized.pagination);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('Не удалось загрузить расходы');
          setItems([]);
          setPagination({ page: filters.page, pageSize: filters.pageSize, total: 0, totalPages: 1 });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    void loadExpenses();
    return () => controller.abort();
  }, [filters.page, filters.pageSize, projectId, queryKey, refreshToken]);

  const totalAmount = useMemo(
    () =>
      items.reduce((acc, item) => {
        const amount = Number.parseFloat(item.amount ?? '0');
        return acc + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [items]
  );

  const categories = useMemo(() => {
    const values = new Map<string, number>();
    items.forEach((item) => {
      const key = item.category || 'Без категории';
      const amount = Number.parseFloat(item.amount ?? '0');
      values.set(key, (values.get(key) ?? 0) + (Number.isFinite(amount) ? amount : 0));
    });
    return Array.from(values.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const vendors = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.vendor) list.add(item.vendor);
    });
    return Array.from(list.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [items]);

  const burnSeries = useMemo(() => {
    const map = new Map<string, number>();
    items
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((item) => {
        const key = item.date.slice(0, 10);
        const amount = Number.parseFloat(item.amount ?? '0');
        map.set(key, (map.get(key) ?? 0) + (Number.isFinite(amount) ? amount : 0));
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

  const canManageExpense = useCallback(
    (expense: Expense | null) => {
      if (!expense) {
        return basePermissions.canCreate;
      }
      if (role === 'owner' || role === 'admin') {
        return true;
      }
      if (role === 'member') {
        if (!viewerEmail) {
          return false;
        }
        return expense.createdBy.trim().toLowerCase() === viewerEmail;
      }
      return false;
    },
    [basePermissions.canCreate, role, viewerEmail]
  );

  const drawerPermissionOverrides = useMemo(() => {
    if (!drawerState.expense) {
      if (role === 'viewer') {
        return { canEdit: false, canManageAttachments: false, canChangeStatus: false };
      }
      return undefined;
    }
    if (role === 'viewer') {
      return { canEdit: false, canManageAttachments: false, canChangeStatus: false };
    }
    if (role === 'member' && !canManageExpense(drawerState.expense)) {
      return { canEdit: false, canManageAttachments: false, canChangeStatus: false };
    }
    return undefined;
  }, [canManageExpense, drawerState.expense, role]);

  const drawerReadOnlyMessage = useMemo(() => {
    if (!drawerState.expense) {
      return null;
    }
    if (role === 'viewer') {
      return 'У вас только доступ на чтение.';
    }
    if (role === 'member' && viewerEmail && drawerState.expense.createdBy.trim().toLowerCase() !== viewerEmail) {
      return 'Редактирование доступно только автору и администраторам.';
    }
    return null;
  }, [drawerState.expense, role, viewerEmail]);

  const openCreate = useCallback(() => {
    if (!basePermissions.canCreate) return;
    dispatchDrawer({ type: 'open-create', payload: { currency } });
    dispatchDrawer({ type: 'update', payload: { projectId } });
  }, [basePermissions.canCreate, currency, projectId]);

  const openExpense = useCallback((expense: Expense) => {
    dispatchDrawer({ type: 'open-view', payload: { expense } });
  }, []);

  const closeDrawer = useCallback(() => dispatchDrawer({ type: 'close' }), []);

  const handleDraftChange = useCallback((patch: Partial<DrawerState['draft']>) => {
    dispatchDrawer({ type: 'update', payload: patch });
  }, []);

  const handleSave = useCallback(async () => {
    if (drawerState.expense) {
      if (!canManageExpense(drawerState.expense)) {
        dispatchDrawer({ type: 'set-error', payload: 'Недостаточно прав для редактирования' });
        return;
      }
    } else if (!basePermissions.canCreate) {
      return;
    }

    dispatchDrawer({ type: 'set-saving', payload: true });
    dispatchDrawer({ type: 'set-error', payload: null });

    const sanitizeText = (value: unknown) => (typeof value === 'string' && value.trim().length ? value.trim() : undefined);
    const currencyCode = sanitizeText(drawerState.draft.currency) ?? currency;
    const normalizedCurrency = /^[A-Z]{3}$/.test(currencyCode.toUpperCase()) ? currencyCode.toUpperCase() : currency.toUpperCase();
    const attachments = Array.isArray(drawerState.draft.attachments)
      ? drawerState.draft.attachments
          .map((attachment) => {
            const filename = sanitizeText(attachment?.filename) ?? 'Файл';
            const url = sanitizeText(attachment?.url);
            if (!url) {
              return null;
            }
            return { filename, url };
          })
          .filter((item): item is { filename: string; url: string } => Boolean(item))
      : [];

    const payload = {
      workspaceId: drawerState.draft.workspaceId ?? DEMO_WORKSPACE_ID,
      projectId,
      date: sanitizeText(drawerState.draft.date) ?? new Date().toISOString().slice(0, 10),
      amount: parseAmountInput(String(drawerState.draft.amount ?? '0')),
      currency: normalizedCurrency,
      category: sanitizeText(drawerState.draft.category) ?? 'Uncategorized',
      description: sanitizeText(drawerState.draft.description),
      vendor: sanitizeText(drawerState.draft.vendor),
      paymentMethod: sanitizeText(drawerState.draft.paymentMethod),
      taxAmount: sanitizeText(drawerState.draft.taxAmount),
      status: drawerState.draft.status ?? 'draft',
      attachments
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
      triggerRefresh();
      broadcastExpensesUpdated();
    } catch (error) {
      console.error(error);
      dispatchDrawer({ type: 'set-error', payload: 'Не удалось сохранить трату' });
    } finally {
      dispatchDrawer({ type: 'set-saving', payload: false });
    }
  }, [
    basePermissions.canCreate,
    canManageExpense,
    closeDrawer,
    currency,
    drawerState.draft,
    drawerState.expense,
    projectId,
    triggerRefresh
  ]);

  const handleStatusChange = useCallback(
    async (status: ExpenseStatus) => {
      if (!drawerState.expense || !basePermissions.canChangeStatus) return;
      if (!canManageExpense(drawerState.expense)) {
        dispatchDrawer({ type: 'set-error', payload: 'Недостаточно прав для изменения статуса' });
        return;
      }
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
        triggerRefresh();
        broadcastExpensesUpdated();
      } catch (error) {
        console.error(error);
        dispatchDrawer({ type: 'set-error', payload: 'Не удалось сменить статус' });
      } finally {
        dispatchDrawer({ type: 'set-saving', payload: false });
      }
    },
    [basePermissions.canChangeStatus, canManageExpense, closeDrawer, drawerState.expense, triggerRefresh]
  );

  const handleExportCsv = useCallback(async () => {
    if (!basePermissions.canExport) {
      return;
    }
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
      const payload = await response.json();
      const normalized = normalizeExpensesResponse(payload, {
        page: 1,
        pageSize: Number.parseInt(params.get('pageSize') ?? '200', 10) || 200
      });
      const rows = normalized.items.map((expense) => ({
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
      const columns = [
        { key: 'date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount' },
        { key: 'currency', label: 'Currency' },
        { key: 'vendor', label: 'Vendor' },
        { key: 'status', label: 'Status' }
      ] as const;
      const lines = [
        columns.map((column) => column.label).join(','),
        ...rows.map((row) =>
          columns
            .map(({ key }) => {
              const value = String(row[key as keyof typeof row] ?? '');
              return /["\n,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
            })
            .join(',')
        )
      ];
      const content = lines.join('\n');
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
  }, [basePermissions.canExport, projectId, queryKey]);

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
      <ExpenseDrawer
        state={drawerState}
        onClose={closeDrawer}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        onStatusChange={handleStatusChange}
        onTabChange={(tab) => dispatchDrawer({ type: 'switch-tab', payload: tab })}
        role={role}
        permissionOverrides={drawerPermissionOverrides}
        readOnlyMessage={drawerReadOnlyMessage}
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

