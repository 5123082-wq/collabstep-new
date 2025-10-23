'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ExpenseDrawer, { type ExpenseProjectOption } from '@/components/finance/ExpenseDrawer';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DEMO_WORKSPACE_ID,
  PAGE_SIZE_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  createDraft,
  drawerReducer,
  formatExpenseAmount,
  formatAttachmentCount,
  normalizeExpensesResponse,
  type AuditEvent,
  type DrawerState,
  type Expense,
  type ExpenseSummary,
  type ExpenseStatus,
  type FinanceRole
} from '@/domain/finance/expenses';
import { parseExpensesCsv, type CsvParseError } from '@/lib/finance/csv-import';
import { buildExpenseFilterParams, parseExpenseFilters, type ExpenseListFilters } from '@/lib/finance/filters';
import { formatMoney, parseAmountInput } from '@/lib/finance/format-money';
import { getExpensePermissions } from '@/lib/finance/permissions';
import { cn } from '@/lib/utils';

const PERIOD_PRESETS = [
  { id: 'all', label: 'Весь период' },
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: 'current-month', label: 'Текущий месяц' }
] as const;

type PeriodPresetId = (typeof PERIOD_PRESETS)[number]['id'] | 'custom';

type ProjectOption = ExpenseProjectOption & { role: FinanceRole };

type ImportReport = {
  processed: number;
  created: number;
  errors: CsvParseError[];
};

type ImportState = {
  open: boolean;
  loading: boolean;
  report: ImportReport | null;
  fileName?: string;
};

const FINANCE_ROLES: FinanceRole[] = ['owner', 'admin', 'member', 'viewer'];

const EXPENSES_UPDATED_EVENT = 'finance:expenses-updated';

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

function normalizeProjectOptionRaw(option: unknown): ProjectOption | null {
  if (!option || typeof option !== 'object') {
    return null;
  }
  const raw = option as Partial<{ id: string; name: string; role: string }>;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  if (!id) {
    return null;
  }
  const name = typeof raw.name === 'string' && raw.name.trim().length ? raw.name.trim() : 'Без названия';
  const role = normalizeFinanceRole(raw.role ?? null);
  return { id, name, role } satisfies ProjectOption;
}

function broadcastExpensesUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(EXPENSES_UPDATED_EVENT));
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(preset: PeriodPresetId): { dateFrom?: string; dateTo?: string } {
  const today = new Date();
  switch (preset) {
    case '7d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { dateFrom: formatDateInput(from), dateTo: formatDateInput(today) };
    }
    case '30d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { dateFrom: formatDateInput(from), dateTo: formatDateInput(today) };
    }
    case 'current-month': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { dateFrom: formatDateInput(from), dateTo: formatDateInput(to) };
    }
    default:
      return {};
  }
}

function detectPreset(filters: ExpenseListFilters): PeriodPresetId {
  if (!filters.dateFrom && !filters.dateTo) {
    return 'all';
  }
  for (const preset of PERIOD_PRESETS) {
    if (preset.id === 'all') {
      continue;
    }
    const range = getPresetRange(preset.id);
    if (range.dateFrom === filters.dateFrom && range.dateTo === filters.dateTo) {
      return preset.id;
    }
  }
  return 'custom';
}

function escapeCsvValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default function FinanceExpensesPageClient({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const [filters, setFilters] = useState<ExpenseListFilters>(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item));
      } else if (value !== undefined) {
        params.set(key, value);
      }
    });
    return parseExpenseFilters(params);
  });
  const [items, setItems] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({ totalCount: 0, totalsByCurrency: [] });
  const [pagination, setPagination] = useState({ page: filters.page, pageSize: filters.pageSize, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [role, setRole] = useState<FinanceRole>('viewer');
  const [viewerEmail, setViewerEmail] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importState, setImportState] = useState<ImportState>({ open: false, loading: false, report: null });
  const [refreshToken, setRefreshToken] = useState(0);

  const [drawerState, dispatchDrawer] = useReducer(drawerReducer, {
    open: false,
    expense: null,
    draft: createDraft(null, 'RUB'),
    saving: false,
    error: null,
    tab: 'details',
    history: [],
    loadingHistory: false
  } satisfies DrawerState);

  useEffect(() => {
    setFilters(parseExpenseFilters(liveSearchParams));
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
    if (filters.projectId) params.set('projectId', filters.projectId);
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
        const payload = (await response.json()) as { authenticated?: boolean; role?: string; email?: string };
        if (cancelled) return;
        if (payload.authenticated) {
          setRole(normalizeFinanceRole(payload.role ?? null));
          setViewerEmail(typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : null);
        } else {
          setRole('viewer');
          setViewerEmail(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    void loadRole();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      try {
        const response = await fetch('/api/finance/projects', { headers: { 'cache-control': 'no-store' } });
        if (!response.ok) {
          throw new Error('FAILED');
        }
        const payload = (await response.json()) as { items?: unknown[] };
        if (!cancelled) {
          const normalized = Array.isArray(payload.items)
            ? payload.items
                .map((item) => normalizeProjectOptionRaw(item))
                .filter((item): item is ProjectOption => Boolean(item))
                .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
            : [];
          setProjects(normalized);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setProjects([]);
        }
      } finally {
        // noop
      }
    }
    void loadProjects();
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
        const response = await fetch(`/api/expenses?${queryKey}`, {
          signal: controller.signal,
          headers: { 'cache-control': 'no-store' }
        });
        if (!response.ok) {
          throw new Error('FAILED');
        }
        const payload = await response.json();
        if (controller.signal.aborted) {
          return;
        }
        const normalized = normalizeExpensesResponse(payload, { page: filters.page, pageSize: filters.pageSize });
        setItems(normalized.items);
        setSummary(normalized.summary);
        setPagination(normalized.pagination);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('Не удалось загрузить расходы');
          setItems([]);
          setSummary({ totalCount: 0, totalsByCurrency: [] });
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
  }, [filters.page, filters.pageSize, queryKey, refreshToken]);

  const updateQuery = useCallback(
    (patch: Partial<ExpenseListFilters>) => {
      const params = buildExpenseFilterParams(liveSearchParams, patch);
      router.replace(`${pathname}${params.toString() ? `?${params}` : ''}`);
    },
    [liveSearchParams, pathname, router]
  );

  const handleFilter = useCallback(
    (patch: Partial<ExpenseListFilters>) => {
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

  const availableProjectOptions = useMemo(() => projects.filter((project) => project.role !== 'viewer'), [projects]);
  const drawerProjects = useMemo(() => {
    if (!drawerState.draft.projectId) {
      return availableProjectOptions;
    }
    if (availableProjectOptions.some((project) => project.id === drawerState.draft.projectId)) {
      return availableProjectOptions;
    }
    const current = projects.find((project) => project.id === drawerState.draft.projectId);
    return current ? [...availableProjectOptions, current] : availableProjectOptions;
  }, [availableProjectOptions, drawerState.draft.projectId, projects]);

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
      if (role === 'member') {
        return { canChangeStatus: false };
      }
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
    if (role === 'member') {
      return { canChangeStatus: false };
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
    dispatchDrawer({ type: 'open-create', payload: { currency: 'RUB' } });
    const preferredProject = filters.projectId ?? availableProjectOptions[0]?.id;
    if (preferredProject) {
      dispatchDrawer({ type: 'update', payload: { projectId: preferredProject } });
    }
  }, [availableProjectOptions, basePermissions.canCreate, filters.projectId]);

  const openExpense = useCallback(
    (expense: Expense) => {
      dispatchDrawer({ type: 'open-view', payload: { expense } });
    },
    []
  );

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

    const projectId = drawerState.draft.projectId?.trim();
    if (!projectId) {
      dispatchDrawer({ type: 'set-error', payload: 'Выберите проект' });
      return;
    }

    dispatchDrawer({ type: 'set-saving', payload: true });
    dispatchDrawer({ type: 'set-error', payload: null });

    const sanitizeText = (value: unknown) => (typeof value === 'string' && value.trim().length ? value.trim() : undefined);
    const currencyRaw = sanitizeText(drawerState.draft.currency) ?? 'RUB';
    const currency = /^[A-Z]{3}$/.test(currencyRaw.toUpperCase()) ? currencyRaw.toUpperCase() : 'RUB';
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
      currency,
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
    } catch (err) {
      console.error(err);
      dispatchDrawer({ type: 'set-error', payload: 'Не удалось сохранить трату' });
    } finally {
      dispatchDrawer({ type: 'set-saving', payload: false });
    }
  }, [
    basePermissions.canCreate,
    canManageExpense,
    closeDrawer,
    drawerState.draft,
    drawerState.expense,
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
      } catch (err) {
        console.error(err);
        dispatchDrawer({ type: 'set-error', payload: 'Не удалось обновить статус' });
      } finally {
        dispatchDrawer({ type: 'set-saving', payload: false });
      }
    },
    [basePermissions.canChangeStatus, canManageExpense, closeDrawer, drawerState.expense, triggerRefresh]
  );

  const loadHistory = useCallback(
    async (expenseId: string) => {
      dispatchDrawer({ type: 'set-history', payload: { items: drawerState.history, loading: true } });
      try {
        const response = await fetch(`/api/expenses/${expenseId}/history`, { headers: { 'cache-control': 'no-store' } });
        if (!response.ok) {
          throw new Error('FAILED');
        }
        const payload = (await response.json()) as { items: AuditEvent[] };
        dispatchDrawer({ type: 'set-history', payload: { items: payload.items ?? [], loading: false } });
      } catch (err) {
        console.error(err);
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

  const totalsByCurrency = summary.totalsByCurrency;

  const categories = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        list.add(item.category);
      }
    });
    return Array.from(list.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [items]);

  const vendors = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.vendor) {
        list.add(item.vendor);
      }
    });
    return Array.from(list.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [items]);

  const presetId = useMemo(() => detectPreset(filters), [filters]);

  const handlePresetChange = useCallback(
    (preset: PeriodPresetId) => {
      if (preset === 'all') {
        handleFilter({ dateFrom: '', dateTo: '' });
        return;
      }
      if (preset === 'custom') {
        return;
      }
      const range = getPresetRange(preset);
      handleFilter(range);
    },
    [handleFilter]
  );

  const handleExportCsv = useCallback(async () => {
    if (!basePermissions.canExport) {
      return;
    }
    try {
      setExporting(true);
      const params = new URLSearchParams(queryKey);
      params.set('pageSize', '100');
      let page = 1;
      const all: Expense[] = [];
      while (true) {
        params.set('page', `${page}`);
        const response = await fetch(`/api/expenses?${params.toString()}`);
        if (!response.ok) {
          throw new Error('EXPORT_ERROR');
        }
        const payload = await response.json();
        const normalized = normalizeExpensesResponse(payload, {
          page,
          pageSize: Number.parseInt(params.get('pageSize') ?? '100', 10) || 100
        });
        all.push(...normalized.items);
        const totalPages = normalized.pagination.totalPages ?? 1;
        if (page >= totalPages) {
          break;
        }
        page += 1;
      }
      const header = ['Date', 'Category', 'Description', 'Amount', 'Currency', 'Project', 'Vendor', 'Status'];
      const rows = all
        .map((expense) =>
          [
            expense.date.slice(0, 10),
            expense.category ?? '',
            expense.description ?? '',
            expense.amount,
            expense.currency,
            expense.projectId,
            expense.vendor ?? '',
            STATUS_LABELS[expense.status]
          ].map(escapeCsvValue).join(',')
        )
        .join('\n');
      const content = `${header.join(',')}\n${rows}`;
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `all-expenses-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }, [basePermissions.canExport, queryKey]);

  const resolveProjectId = useCallback(
    (value: string): string | null => {
      if (!value) {
        return null;
      }
      const normalized = value.trim().toLowerCase();
      const direct = projects.find((project) => project.id.toLowerCase() === normalized);
      if (direct) {
        return direct.id;
      }
      const byName = projects.find((project) => project.name.trim().toLowerCase() === normalized);
      return byName ? byName.id : null;
    },
    [projects]
  );

  const handleImportFile = useCallback(
    async (file: File) => {
      if (!basePermissions.canImport) {
        return;
      }
      setImportState((state) => ({ ...state, loading: true, report: null, fileName: file.name }));
      try {
        const text = await file.text();
        const { records, errors: validationErrors, processed } = parseExpensesCsv(text);
        const report: ImportReport = { processed, created: 0, errors: [...validationErrors] };
        const sanitize = (value?: string) => (value && value.trim().length ? value.trim() : undefined);
        for (const row of records) {
          const rowNumber = row.rowNumber;
          const projectId = resolveProjectId(row.project);
          if (!projectId) {
            report.errors.push({ row: rowNumber, reason: 'Проект не найден' });
            continue;
          }
          const projectRole = projects.find((project) => project.id === projectId)?.role ?? 'viewer';
          if (projectRole === 'viewer') {
            report.errors.push({ row: rowNumber, reason: 'Недостаточно прав для проекта' });
            continue;
          }
          const payload = {
            workspaceId: DEMO_WORKSPACE_ID,
            projectId,
            date: row.date || new Date().toISOString().slice(0, 10),
            amount: parseAmountInput(row.amount || '0'),
            currency: (row.currency || 'RUB').toUpperCase(),
            category: sanitize(row.category) ?? 'Uncategorized',
            description: sanitize(row.description),
            vendor: sanitize(row.vendor),
            status: 'draft' as ExpenseStatus
          };
          try {
            const response = await fetch('/api/expenses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              throw new Error('CREATE_ERROR');
            }
            report.created += 1;
          } catch (err) {
            console.error(err);
            report.errors.push({ row: rowNumber, reason: 'Ошибка создания' });
          }
        }
        setImportState((state) => ({ ...state, loading: false, report }));
        triggerRefresh();
        broadcastExpensesUpdated();
      } catch (err) {
        console.error(err);
        setImportState((state) => ({
          ...state,
          loading: false,
          report: { processed: 0, created: 0, errors: [{ row: 0, reason: 'Не удалось обработать файл' }] }
        }));
      }
    },
    [basePermissions.canImport, projects, resolveProjectId, triggerRefresh]
  );

  const presetButtons = PERIOD_PRESETS.map((preset) => {
    const active = preset.id === presetId;
    return (
      <button
        key={preset.id}
        type="button"
        onClick={() => handlePresetChange(preset.id)}
        className={cn(
          'rounded-full border border-neutral-800 px-3 py-1 text-xs transition',
          active ? 'bg-indigo-500 text-white' : 'text-neutral-300 hover:text-white'
        )}
      >
        {preset.label}
      </button>
    );
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Расходы</h1>
          <p className="text-sm text-neutral-400">Глобальный журнал расходов по всем проектам.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {basePermissions.canCreate ? (
            <button
              type="button"
              onClick={openCreate}
              disabled={!availableProjectOptions.length && !filters.projectId}
              className={cn(
                'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition',
                !availableProjectOptions.length && !filters.projectId ? 'opacity-40' : 'hover:bg-indigo-400'
              )}
            >
              Новая трата
            </button>
          ) : null}
          {basePermissions.canImport ? (
            <button
              type="button"
              onClick={() => setImportState((state) => ({ ...state, open: true, report: null }))}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
            >
              Импорт CSV
            </button>
          ) : null}
          {basePermissions.canExport ? (
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting || !items.length}
                className={cn(
                  'rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition',
                  exporting || !items.length ? 'opacity-40' : 'hover:border-indigo-400/60 hover:text-white'
                )}
              >
                {exporting ? 'Экспорт...' : 'Экспорт CSV'}
              </button>
              <button
                type="button"
                className="rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400"
                disabled
                title="Скоро"
              >
                Экспорт XLSX
              </button>
            </>
          ) : null}
        </div>
      </header>

      <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-4">
        <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
          <label className="flex flex-col gap-1">
            Проект
            <select
              value={filters.projectId ?? ''}
              onChange={(event) => handleFilter({ projectId: event.target.value })}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
            >
              <option value="">Все проекты</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            Период
            <div className="flex flex-wrap gap-2">{presetButtons}</div>
          </div>
          <label className="flex flex-col gap-1">
            С
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => handleFilter({ dateFrom: event.target.value })}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1">
            По
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => handleFilter({ dateTo: event.target.value })}
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
            />
          </label>
          <label className="flex flex-col gap-1">
            Статус
            <select
              value={filters.status ?? ''}
              onChange={(event) =>
                handleFilter(
                  event.target.value
                    ? ({ status: event.target.value as ExpenseStatus } as Partial<ExpenseListFilters>)
                    : ({ status: '' as unknown as ExpenseStatus } as Partial<ExpenseListFilters>)
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
          <label className="flex flex-col gap-1">
            Категория
            <select
              value={filters.category ?? ''}
              onChange={(event) => handleFilter({ category: event.target.value })}
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
          <label className="flex flex-col gap-1">
            Поставщик
            <select
              value={filters.vendor ?? ''}
              onChange={(event) => handleFilter({ vendor: event.target.value })}
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
          <label className="flex flex-col gap-1">
            Поиск
            <input
              type="search"
              value={filters.q ?? ''}
              onChange={(event) => handleFilter({ q: event.target.value })}
              placeholder="Описание, поставщик..."
              className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
            />
          </label>
        </div>
      </section>

      <div className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-400">
          <div className="flex flex-wrap items-center gap-4">
            <span>Записей: {summary.totalCount}</span>
            <span className="flex items-center gap-2">
              Итого:
              {totalsByCurrency.length ? (
                totalsByCurrency.map(({ currency, amount }) => (
                  <span key={currency} className="font-semibold text-white">
                    {formatExpenseAmount(amount, currency, 'ru-RU')}
                  </span>
                ))
              ) : (
                <span className="text-neutral-300">—</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleFilter({ pageSize: size })}
                className={cn(
                  'rounded-full px-3 py-1 transition',
                  size === filters.pageSize ? 'bg-indigo-500/80 text-white' : 'hover:text-white'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="mt-4 flex min-h-[240px] items-center justify-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-neutral-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => updateQuery({ page: filters.page })}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
            >
              Повторить
            </button>
          </div>
        ) : !items.length ? (
          <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center gap-2 text-sm text-neutral-300">
            <p>Нет расходов по выбранным фильтрам.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-900 bg-neutral-950/60">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-900 text-sm">
                <thead className="bg-neutral-900/60 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Дата</th>
                    <th className="px-4 py-3 text-left">Категория</th>
                    <th className="px-4 py-3 text-left">Описание</th>
                    <th className="px-4 py-3 text-left">Сумма</th>
                    <th className="px-4 py-3 text-left">Проект</th>
                    <th className="px-4 py-3 text-left">Поставщик</th>
                    <th className="px-4 py-3 text-left">Статус</th>
                    <th className="px-4 py-3 text-left">Вложения</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-sm text-neutral-300">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer transition hover:bg-neutral-900/60"
                      onClick={() => openExpense(item)}
                    >
                      <td className="px-4 py-3 align-top text-sm text-neutral-100">
                        {new Date(item.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-100">{item.category || 'Без категории'}</td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-300">{item.description ?? '—'}</td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-100">
                        {formatMoney(item.amount, item.currency, 'ru-RU')}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-300">{item.projectId}</td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-300">{item.vendor ?? '—'}</td>
                      <td className="px-4 py-3 align-top">
                        <Badge className={cn('px-2 py-1 text-xs', STATUS_COLORS[item.status])}>{STATUS_LABELS[item.status]}</Badge>
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-neutral-300">
                        {formatAttachmentCount(item.attachments)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-900 bg-neutral-950/80 px-4 py-3 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => handlePagination(Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className="rounded-full border border-neutral-800 px-3 py-1 text-neutral-300 disabled:opacity-40"
              >
                Назад
              </button>
              <span>
                Стр. {filters.page} из {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePagination(Math.min(pagination.totalPages, filters.page + 1))}
                disabled={filters.page >= pagination.totalPages}
                className="rounded-full border border-neutral-800 px-3 py-1 text-neutral-300 disabled:opacity-40"
              >
                Вперёд
              </button>
            </div>
          </div>
        )}
      </div>

      <ExpenseDrawer
        state={drawerState}
        role={role}
        onClose={closeDrawer}
        onDraftChange={handleDraftChange}
        onSave={handleSave}
        onStatusChange={handleStatusChange}
        onTabChange={(tab) => dispatchDrawer({ type: 'switch-tab', payload: tab })}
        projectOptions={drawerProjects}
        projectSelectionDisabled={Boolean(drawerState.expense)}
        permissionOverrides={drawerPermissionOverrides}
        readOnlyMessage={drawerReadOnlyMessage}
      />

      <Sheet
        open={importState.open}
        onOpenChange={(open) =>
          setImportState((state) => ({ ...state, open, report: open ? state.report : null }))
        }
      >
        <SheetContent side="right" className="flex h-full flex-col bg-neutral-950/95">
          <SheetHeader className="space-y-2">
            <SheetTitle>Импорт CSV</SheetTitle>
            <button
              type="button"
              onClick={() => setImportState((state) => ({ ...state, open: false }))}
              className="absolute right-4 top-4 rounded-full border border-neutral-800 px-2 py-1 text-xs text-neutral-400 hover:text-white"
            >
              ×
            </button>
          </SheetHeader>
          <div className="mt-4 space-y-4 text-sm text-neutral-200">
            <p>Формат: Date, Amount, Currency, Category, Description, Vendor, Project(name|id).</p>
            <label className="flex flex-col gap-2">
              <span className="text-xs text-neutral-400">Выберите файл CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImportFile(file);
                    event.target.value = '';
                  }
                }}
                className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100"
              />
            </label>
            {importState.loading ? (
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                Загрузка...
              </div>
            ) : null}
            {importState.report ? (
              <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-100">
                <p className="text-neutral-300">
                  Обработано строк: {importState.report.processed}, создано черновиков: {importState.report.created}
                </p>
                {importState.report.errors.length ? (
                  <div className="space-y-1 text-sm text-rose-300">
                    <p>Ошибки:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {importState.report.errors.map((error, index) => (
                        <li key={`${error.row}-${index}`}>
                          Строка {error.row}: {error.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-emerald-300">Ошибок нет</p>
                )}
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
