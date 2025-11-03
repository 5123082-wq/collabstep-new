'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ProjectCard } from '@collabverse/api';
import { trackEvent } from '@/lib/telemetry';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/lib/ui/useDebouncedValue';
import ProjectsControlPanel from '@/components/projects/ProjectsControlPanel';
import {
  DEFAULT_SORT,
  ProjectsOverviewFilters,
  ProjectsOverviewSort,
  ProjectsOverviewState,
  ProjectsOverviewTab,
  SelectOption,
  buildOwnerOptions,
  buildParticipantOptions,
  buildSearchParams,
  buildTagOptions,
  createDefaultState,
  createApiFilters,
  encodeFiltersParam,
  isFiltersEqual,
  isStateEqual,
  mapProjectCard,
  parseStateFromSearchParams
} from './projects-overview-state';

const LIST_ROW_ESTIMATE = 220;
const VIRTUALIZATION_THRESHOLD = 50;

type ViewMode = 'grid' | 'list';

type QuickActionHandlers = {
  onOpen: (projectId: string) => void;
  onCreateTask: (projectId: string) => void;
  onInvite: (projectId: string) => void;
  onToggleArchive: (projectId: string, archived: boolean) => Promise<void>;
};

interface ProjectCardProps extends QuickActionHandlers {
  project: ProjectCard;
  actionInFlight: string | null;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(date);
}

function formatProgress(progress: number): string {
  return `${Math.max(0, Math.min(100, progress))}%`;
}

function formatBudgetAmount(value?: number | string | null): string {
  const numericValue =
    typeof value === 'string' && value.trim().length > 0 ? Number(value) : value;

  if (typeof numericValue !== 'number' || Number.isNaN(numericValue)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(numericValue);
  } catch (err) {
    console.warn('[projects-overview] failed to format budget amount', err);
    return '—';
  }
}

const PROJECT_TYPE_LABELS: Record<NonNullable<ProjectCard['type']> | 'internal', string> = {
  product: 'Продукт',
  marketing: 'Маркетинг',
  operations: 'Операции',
  service: 'Услуги',
  internal: 'Внутренний'
};

const PROJECT_VISIBILITY_LABELS: Record<ProjectCard['visibility'], string> = {
  private: 'Приватный',
  public: 'Публичный'
};

function formatProjectType(value?: ProjectCard['type']): string {
  if (!value) {
    return PROJECT_TYPE_LABELS.internal;
  }
  return PROJECT_TYPE_LABELS[value] ?? PROJECT_TYPE_LABELS.internal;
}

function formatProjectVisibility(value: ProjectCard['visibility']): string {
  return PROJECT_VISIBILITY_LABELS[value] ?? PROJECT_VISIBILITY_LABELS.private;
}

function Avatar({
  name,
  email,
  avatarUrl,
  size
}: {
  name?: string | null | undefined;
  email?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  size: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name || email || 'avatar'}
        width={size}
        height={size}
        className="rounded-full border border-neutral-900 object-cover"
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  const initials = (name ?? email ?? '?').slice(0, 2).toUpperCase();
  return (
    <span
      className="flex items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 text-xs font-semibold text-neutral-300"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

function ProjectGridCard({ project, onOpen, onCreateTask, onInvite, onToggleArchive, actionInFlight }: ProjectCardProps) {
  const isArchived = project.status === 'archived';
  const { canArchive, canCreateTask, canInvite, canView } = project.permissions; // [PLAN:S2-210] Быстрые действия по ролям.
  return (
    <article className="flex h-full flex-col justify-between gap-1.5 rounded-2xl border border-neutral-900 bg-neutral-950/50 p-2 shadow-md shadow-black/10">
      <div className="space-y-1">
        <header className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-white line-clamp-1">{project.title}</h3>
              <p className="text-[10px] text-neutral-400 line-clamp-1">{project.description || 'Описание появится позже.'}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap flex-shrink-0',
                isArchived
                  ? 'border border-rose-500/40 bg-rose-500/10 text-rose-200'
                  : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              )}
            >
              {isArchived ? 'В архиве' : 'Активен'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[9px] text-neutral-400">
            <span className="rounded-full bg-neutral-900 px-1 py-0.5 line-clamp-1">Пространство: {project.workspace.name}</span>
            <span className="rounded-full bg-neutral-900 px-1 py-0.5">Тип: {formatProjectType(project.type)}</span>
            <span className="rounded-full bg-neutral-900 px-1 py-0.5">
              Доступ: {formatProjectVisibility(project.visibility)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[9px] text-neutral-400">
            {project.stage ? <span className="rounded-full bg-neutral-900 px-1 py-0.5">Стадия: {project.stage}</span> : null}
            <span className="rounded-full bg-neutral-900 px-1 py-0.5">Создан: {formatDate(project.createdAt)}</span>
            <span className="rounded-full bg-neutral-900 px-1 py-0.5">Дедлайн: {formatDate(project.deadline)}</span>
          </div>
        </header>
        <section className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Avatar name={project.owner.name} email={project.owner.email} avatarUrl={project.owner.avatarUrl} size={20} />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-wide text-neutral-500">Владелец</p>
              <p className="text-[10px] font-medium text-neutral-100 truncate">{project.owner.name || project.owner.email}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] uppercase tracking-wide text-neutral-500">Задачи</p>
            <div className="grid grid-cols-3 gap-1 text-center text-[9px] text-neutral-300">
              <div className="rounded-lg border border-neutral-900/80 bg-neutral-900/60 p-1">
                <p className="text-xs font-semibold text-white">{project.tasks.total}</p>
                <p className="text-[8px] uppercase tracking-wide text-neutral-500">Всего</p>
              </div>
              <div className="rounded-lg border border-neutral-900/80 bg-neutral-900/60 p-1">
                <p className="text-xs font-semibold text-amber-200">{project.tasks.overdue}</p>
                <p className="text-[8px] uppercase tracking-wide text-neutral-500">Просрочено</p>
              </div>
              <div className="rounded-lg border border-neutral-900/80 bg-neutral-900/60 p-1">
                <p className="text-xs font-semibold text-indigo-200">{project.tasks.important}</p>
                <p className="text-[8px] uppercase tracking-wide text-neutral-500">Важные</p>
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-0.5">
          <p className="text-[9px] uppercase tracking-wide text-neutral-500">Бюджет</p>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-neutral-300">
            <div className="rounded-lg border border-neutral-900/80 bg-neutral-900/60 p-1">
              <p className="text-[8px] uppercase tracking-wide text-neutral-500">Запланировано</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white truncate">{formatBudgetAmount(project.budget.planned)}</p>
            </div>
            <div className="rounded-lg border border-neutral-900/80 bg-neutral-900/60 p-1">
              <p className="text-[8px] uppercase tracking-wide text-neutral-500">Потрачено</p>
              <p className="mt-0.5 text-[10px] font-semibold text-white truncate">{formatBudgetAmount(project.budget.spent)}</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="flex flex-col gap-1 pt-1 border-t border-neutral-900/50">
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-wide text-neutral-500 mb-0.5">Прогресс</p>
          <div className="h-1 w-full rounded-full bg-neutral-900">
            <div className="h-1 rounded-full bg-indigo-500" style={{ width: formatProgress(project.progress) }} />
          </div>
          <p className="mt-0.5 text-[9px] text-neutral-400">{formatProgress(project.progress)} завершено</p>
        </div>
      </footer>
    </article>
  );
}
function ProjectListCard({ project, onOpen, onCreateTask, onInvite, onToggleArchive, actionInFlight }: ProjectCardProps) {
  const isArchived = project.status === 'archived';
  const { canArchive, canCreateTask, canInvite, canView } = project.permissions; // [PLAN:S2-211] ACL для списочного вида.
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/60 p-5 shadow-sm shadow-black/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                isArchived
                  ? 'border border-rose-500/40 bg-rose-500/10 text-rose-200'
                  : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
              )}
            >
              {isArchived ? 'В архиве' : 'Активен'}
            </span>
          </div>
          <p className="text-sm text-neutral-400">{project.description || 'Описание появится позже.'}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="rounded-full bg-neutral-900 px-2 py-1">Пространство: {project.workspace.name}</span>
            <span className="rounded-full bg-neutral-900 px-2 py-1">Тип: {formatProjectType(project.type)}</span>
            <span className="rounded-full bg-neutral-900 px-2 py-1">
              Доступ: {formatProjectVisibility(project.visibility)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
            <span>Создан: {formatDate(project.createdAt)}</span>
            <span>Дедлайн: {formatDate(project.deadline)}</span>
            {project.stage ? <span>Стадия: {project.stage}</span> : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Avatar name={project.owner.name} email={project.owner.email} avatarUrl={project.owner.avatarUrl} size={36} />
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Владелец</p>
              <p className="text-sm font-medium text-neutral-100">{project.owner.name || project.owner.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Команда:</p>
            <div className="flex -space-x-2">
              {project.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} name={member.name} email={member.email} avatarUrl={member.avatarUrl} size={28} />
              ))}
              {project.members.length > 5 ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-900 bg-neutral-900 text-[11px] text-neutral-300">
                  +{project.members.length - 5}
                </span>
              ) : null}
            </div>
          </div>
          {project.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-300">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="w-full space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Прогресс</p>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-900">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: formatProgress(project.progress) }} />
            </div>
            <p className="mt-1 text-xs text-neutral-400">{formatProgress(project.progress)} завершено</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-neutral-300">
            <div className="rounded-xl border border-neutral-900/80 bg-neutral-900/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">Запланировано</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatBudgetAmount(project.budget.planned)}</p>
            </div>
            <div className="rounded-xl border border-neutral-900/80 bg-neutral-900/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">Потрачено</p>
              <p className="mt-1 text-sm font-semibold text-white">{formatBudgetAmount(project.budget.spent)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-neutral-300">
            <div className="rounded-xl border border-neutral-900/80 bg-neutral-900/60 p-2">
              <p className="text-lg font-semibold text-white">{project.tasks.total}</p>
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">Всего</p>
            </div>
            <div className="rounded-xl border border-neutral-900/80 bg-neutral-900/60 p-2">
              <p className="text-lg font-semibold text-amber-200">{project.tasks.overdue}</p>
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">Просрочено</p>
            </div>
            <div className="rounded-xl border border-neutral-900/80 bg-neutral-900/60 p-2">
              <p className="text-lg font-semibold text-indigo-200">{project.tasks.important}</p>
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">Важные</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpen(project.id)}
            disabled={!canView}
            className={cn(
              'rounded-full border border-indigo-500/60 px-4 py-2 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-white',
              !canView ? 'cursor-not-allowed opacity-60 hover:border-indigo-500/60 hover:bg-transparent hover:text-indigo-200' : undefined
            )}
          >
            Открыть
          </button>
          {canCreateTask ? (
            <button
              type="button"
              onClick={() => onCreateTask(project.id)}
              className="rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-600 hover:bg-neutral-900"
            >
              Создать задачу
            </button>
          ) : null}
          {canInvite ? (
            <button
              type="button"
              onClick={() => onInvite(project.id)}
              className="rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-neutral-600 hover:bg-neutral-900"
            >
              Пригласить
            </button>
          ) : null}
        </div>
        {canArchive ? (
          <button
            type="button"
            onClick={() => onToggleArchive(project.id, !isArchived)}
            disabled={actionInFlight === project.id}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
              isArchived
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400 hover:text-emerald-100'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:border-rose-400 hover:text-rose-100',
              actionInFlight === project.id ? 'opacity-75' : undefined
            )}
            >
              {actionInFlight === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isArchived ? 'Восстановить' : 'Архивировать'}
            </button>
        ) : null}
      </div>
    </article>
  );
}

function FiltersMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder
}: {
  label: string;
  options: SelectOption[];
  value: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <select
        multiple
        value={value}
        onChange={(event) => {
          const selected = Array.from(event.target.selectedOptions, (option) => option.value);
          onChange(selected);
        }}
        className="min-h-[82px] w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
      >
        {options.length === 0 ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function GridSkeletonCard() {
  return (
    <div className="h-full animate-pulse rounded-2xl border border-neutral-900 bg-neutral-950/40 p-2">
      <div className="flex h-full flex-col gap-1.5">
        <div className="space-y-1">
          <div className="h-3 w-3/4 rounded bg-neutral-900/80" />
          <div className="h-2 w-full rounded bg-neutral-900/70" />
          <div className="h-2 w-1/2 rounded bg-neutral-900/60" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="h-6 w-full rounded-lg bg-neutral-900/70" />
          <div className="h-8 w-full rounded-lg bg-neutral-900/60" />
        </div>
        <div className="h-1 w-full rounded bg-neutral-900/70" />
      </div>
    </div>
  );
}

function ListSkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-900 bg-neutral-950/40 p-5">
      <div className="space-y-4">
        <div className="h-5 w-1/3 rounded bg-neutral-900/80" />
        <div className="h-4 w-full rounded bg-neutral-900/70" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-14 rounded-xl bg-neutral-900/60" />
          <div className="h-14 rounded-xl bg-neutral-900/60" />
          <div className="h-14 rounded-xl bg-neutral-900/60" />
        </div>
        <div className="h-3 w-full rounded bg-neutral-900/70" />
      </div>
    </div>
  );
}

const TAB_OPTIONS: { key: ProjectsOverviewTab; label: string }[] = [
  { key: 'all', label: 'Все проекты' },
  { key: 'mine', label: 'Мои проекты' },
  { key: 'member', label: 'Я участник' }
];

const SORT_OPTIONS: { value: ProjectsOverviewSort; label: string }[] = [
  { value: 'updated-desc', label: 'Сначала обновлённые' },
  { value: 'updated-asc', label: 'Сначала старые' },
  { value: 'deadline-asc', label: 'Ближайший дедлайн' },
  { value: 'deadline-desc', label: 'Самый поздний дедлайн' },
  { value: 'progress-asc', label: 'Прогресс (0 → 100)' },
  { value: 'progress-desc', label: 'Прогресс (100 → 0)' },
  { value: 'alphabetical', label: 'По алфавиту' }
];

const STATUS_OPTIONS: { value: ProjectsOverviewFilters['status']; label: string }[] = [
  { value: 'all', label: 'Все проекты' },
  { value: 'active', label: 'Только активные' },
  { value: 'archived', label: 'Только архив' }
];

const DATE_FIELD_OPTIONS: { value: ProjectsOverviewFilters['dateField']; label: string }[] = [
  { value: 'createdAt', label: 'Дата создания' },
  { value: 'deadline', label: 'Дедлайн' }
];

const GRID_SKELETON_COUNT = 6;
const LIST_SKELETON_COUNT = 6;

function TabDropdown({
  options,
  selectedTab,
  onSelectTab
}: {
  options: { key: ProjectsOverviewTab; label: string }[];
  selectedTab: ProjectsOverviewTab;
  onSelectTab: (tab: ProjectsOverviewTab) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((opt) => opt.key === selectedTab) ?? options[0] ?? { key: 'all' as ProjectsOverviewTab, label: 'Все проекты' };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition',
          'border-indigo-400/60 bg-indigo-500/20 text-white hover:border-indigo-400 hover:bg-indigo-500/30'
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span>{selectedOption.label}</span>
        <svg
          className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen ? (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 z-50 mt-2 min-w-[12rem] origin-top-left overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectTab(option.key);
                setIsOpen(false);
              }}
              className={cn(
                'block w-full px-4 py-2 text-left text-sm transition',
                selectedTab === option.key
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-neutral-300 hover:bg-indigo-500/10 hover:text-white'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProjectsOverviewPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<ProjectsOverviewState>(() => {
    const params = searchParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();
    const parsed = parseStateFromSearchParams(params);
    if (params.has('sort')) {
      return parsed;
    }
    return { ...parsed, sort: DEFAULT_SORT };
  });
  const stateRef = useRef(state);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const listParentRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { items: ProjectCard[]; total: number }>>(new Map());

  const debouncedQuery = useDebouncedValue(state.query, 350);

  const ownerOptions = useMemo(() => buildOwnerOptions(projects), [projects]);
  const participantOptions = useMemo(() => buildParticipantOptions(projects), [projects]);
  const tagOptions = useMemo(() => buildTagOptions(projects), [projects]);
  const tagSelectOptions = useMemo(
    () => tagOptions.map((tag) => ({ id: tag, label: `#${tag}` })),
    [tagOptions]
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    trackEvent('projects.overview.viewed', { tab: state.tab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = searchParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();
    const nextState = parseStateFromSearchParams(params);
    const normalizedState = params.has('sort') ? nextState : { ...nextState, sort: DEFAULT_SORT };
    if (!isStateEqual(stateRef.current, normalizedState)) {
      stateRef.current = normalizedState;
      setState(normalizedState);
    }
  }, [searchParams]);

  const applyStateToUrl = useCallback(
    (next: ProjectsOverviewState) => {
      const params = buildSearchParams(next);
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [pathname, router]
  );

  const setStateAndSync = useCallback(
    (updater: (prev: ProjectsOverviewState) => ProjectsOverviewState) => {
      setState((prev) => {
        const next = updater(prev);
        if (isStateEqual(prev, next)) {
          return prev;
        }
        stateRef.current = next;
        applyStateToUrl(next);
        return next;
      });
    },
    [applyStateToUrl]
  );

  const updateFilters = useCallback(
    (updater: (prev: ProjectsOverviewFilters) => ProjectsOverviewFilters) => {
      setStateAndSync((prev) => {
        const nextFilters = updater(prev.filters);
        if (isFiltersEqual(prev.filters, nextFilters)) {
          return prev;
        }
        return { ...prev, filters: nextFilters };
      });
    },
    [setStateAndSync]
  );

  const requestKey = useMemo(() => {
    const filtersPayload = createApiFilters(state.filters);
    return JSON.stringify({
      tab: state.tab,
      query: debouncedQuery.trim(),
      sort: state.sort,
      filters: filtersPayload
    });
  }, [debouncedQuery, state.filters, state.sort, state.tab]);

  const shouldVirtualize = viewMode === 'list' && projects.length > VIRTUALIZATION_THRESHOLD;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? projects.length : 0,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => LIST_ROW_ESTIMATE,
    overscan: 6
  });

  useEffect(() => {
    if (shouldVirtualize && listParentRef.current) {
      listParentRef.current.scrollTo({ top: 0 });
    }
  }, [requestKey, shouldVirtualize]);

  useEffect(() => {
    const key = requestKey;
    if (!key) {
      return () => undefined;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const skipCache = refreshNonce > 0;

    if (!skipCache && cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key)!;
      setProjects(cached.items);
      setTotal(cached.total);
      setLoading(false);
      setError(null);
      return () => controller.abort();
    }

    setLoading(true);
    setError(null);

    const fetchProjects = async () => {
      try {
        const params = new URLSearchParams();
        params.set('tab', state.tab);
        params.set('sort', state.sort);
        const trimmedQuery = debouncedQuery.trim();
        if (trimmedQuery.length > 0) {
          params.set('query', trimmedQuery);
        }
        const encodedFilters = encodeFiltersParam(state.filters);
        if (encodedFilters) {
          params.set('filters', encodedFilters);
        }

        const response = await fetch(`/api/projects?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as { items?: ProjectCard[]; total?: number };
        const rawItems = Array.isArray(payload.items) ? payload.items : [];
        const mappedItems = rawItems.map(mapProjectCard);
        const totalValue = typeof payload.total === 'number' ? payload.total : mappedItems.length;

        cacheRef.current.set(key, { items: mappedItems, total: totalValue });

        if (!controller.signal.aborted) {
          setProjects(mappedItems);
          setTotal(totalValue);
          setError(null);
          if (skipCache) {
            setRefreshNonce(0);
          }
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('[projects-overview] failed to fetch projects', err);
        setError('Не удалось загрузить проекты. Попробуйте обновить страницу.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchProjects();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, refreshNonce, requestKey, state.filters, state.sort, state.tab]);

  const handleChangeTab = useCallback(
    (nextTab: ProjectsOverviewTab) => {
      setStateAndSync((prev) => {
        if (prev.tab === nextTab) {
          return prev;
        }
        return { ...prev, tab: nextTab };
      });
    },
    [setStateAndSync]
  );

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextQuery = event.target.value;
      setStateAndSync((prev) => ({ ...prev, query: nextQuery }));
    },
    [setStateAndSync]
  );

  const handleSortChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as ProjectsOverviewSort;
      setStateAndSync((prev) => ({ ...prev, sort: value }));
    },
    [setStateAndSync]
  );

  const handleStatusChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as ProjectsOverviewFilters['status'];
      updateFilters((prev) => ({
        ...prev,
        status: value
      }));
    },
    [updateFilters]
  );

  const handleOwnersChange = useCallback((owners: string[]) => {
    updateFilters((prev) => ({
      ...prev,
      owners
    }));
  }, [updateFilters]);

  const handleParticipantsChange = useCallback((participants: string[]) => {
    updateFilters((prev) => ({
      ...prev,
      participants
    }));
  }, [updateFilters]);

  const handleTagsChange = useCallback((tags: string[]) => {
    updateFilters((prev) => ({
      ...prev,
      tags
    }));
  }, [updateFilters]);

  const handleDateFieldChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as ProjectsOverviewFilters['dateField'];
      updateFilters((prev) => ({
        ...prev,
        dateField: value
      }));
    },
    [updateFilters]
  );

  const handleDateFromChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateFilters((prev) => ({
        ...prev,
        dateFrom: value ? value : null
      }));
    },
    [updateFilters]
  );

  const handleDateToChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateFilters((prev) => ({
        ...prev,
        dateTo: value ? value : null
      }));
    },
    [updateFilters]
  );

  const handleResetFilters = useCallback(() => {
    cacheRef.current.clear();
    setStateAndSync((prev) => ({
      ...createDefaultState(),
      tab: prev.tab
    }));
    setActionError(null);
  }, [setStateAndSync]);

  const handleRefresh = useCallback(() => {
    setError(null);
    cacheRef.current.delete(requestKey);
    setRefreshNonce((prev) => prev + 1);
  }, [requestKey]);

  const handleChangeView = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'list' && listParentRef.current) {
      listParentRef.current.scrollTo({ top: 0 });
    }
  }, []);

  const handleOpenProject = useCallback(
    (projectId: string) => {
      trackEvent('projects.card.opened', { projectId });
      router.push(`/project/${projectId}/overview`);
    },
    [router]
  );

  const handleCreateTask = useCallback(
    (projectId: string) => {
      trackEvent('projects.quickAction.clicked', { projectId, action: 'create-task' });
      router.push(`/project/${projectId}/tasks`);
    },
    [router]
  );

  const handleInvite = useCallback(
    (projectId: string) => {
      trackEvent('projects.quickAction.clicked', { projectId, action: 'invite' });
      router.push(`/project/${projectId}/team`);
    },
    [router]
  );

  const handleToggleArchive = useCallback(
    async (projectId: string, archived: boolean) => {
      trackEvent('projects.quickAction.clicked', { projectId, action: archived ? 'archive' : 'unarchive' });
      setActionInFlight(projectId);
      setActionError(null);
      try {
        const endpoint = `/api/projects/${projectId}/${archived ? 'archive' : 'unarchive'}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const nextStatus: ProjectCard['status'] = archived ? 'archived' : 'active';
        setProjects((prev) =>
          prev.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  status: nextStatus
                }
              : project
          )
        );
        cacheRef.current.forEach((cached, key) => {
          const index = cached.items.findIndex((item) => item.id === projectId);
          if (index < 0) {
            return;
          }
          const current = cached.items[index];
          if (!current) {
            return;
          }
          const updatedItems = [...cached.items];
          updatedItems[index] = { ...current, status: nextStatus };
          cacheRef.current.set(key, { ...cached, items: updatedItems });
        });
      } catch (err) {
        console.error('[projects-overview] failed to toggle archive', err);
        setActionError('Не удалось изменить статус проекта. Попробуйте ещё раз.');
      } finally {
        setActionInFlight(null);
      }
    },
    []
  );

  const showSkeletons = loading && projects.length === 0;
  const showEmptyState = !loading && projects.length === 0 && !error;

  useEffect(() => {
    if (!isFiltersModalOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFiltersModalOpen]);

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-white">Обзор проектов</h1>
          <p className="text-sm text-neutral-400">
            Быстрый доступ к инициативам команды, фильтры и карточки с ключевыми метриками.
          </p>
        </div>
      </header>

      <section className="space-y-6">
        {/* Компактный блок с меню навигации и основными фильтрами */}
        <ProjectsControlPanel
          viewMode={viewMode}
          onViewModeChange={handleChangeView}
          onReset={handleResetFilters}
          onSettingsClick={() => setIsFiltersModalOpen(true)}
          filters={
            <TabDropdown
              options={TAB_OPTIONS}
              selectedTab={state.tab}
              onSelectTab={handleChangeTab}
            />
          }
        />

        {/* Модальное окно с полными фильтрами */}
        {isFiltersModalOpen ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsFiltersModalOpen(false)}
              aria-hidden="true"
            />
            <div
              className="fixed inset-4 z-50 mx-auto max-w-4xl overflow-auto rounded-2xl border border-neutral-900 bg-neutral-950/95 p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Настройки фильтров и сортировки</h2>
                <button
                  type="button"
                  onClick={() => setIsFiltersModalOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
                  aria-label="Закрыть"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Сортировка */}
                <div>
                  <label className="mb-2 block text-sm">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">Сортировка</span>
                    <select
                      value={state.sort}
                      onChange={handleSortChange}
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Дополнительные фильтры */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FiltersMultiSelect
                    label="Владельцы"
                    options={ownerOptions}
                    value={state.filters.owners}
                    placeholder="Пока нет вариантов"
                    onChange={handleOwnersChange}
                  />
                  <FiltersMultiSelect
                    label="Участники"
                    options={participantOptions}
                    value={state.filters.participants}
                    placeholder="Пока нет вариантов"
                    onChange={handleParticipantsChange}
                  />
                  <FiltersMultiSelect
                    label="Метки"
                    options={tagSelectOptions}
                    value={state.filters.tags}
                    placeholder="Нет меток"
                    onChange={handleTagsChange}
                  />
                </div>

                {/* Фильтры по дате */}
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-sm">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">Поле даты</span>
                    <select
                      value={state.filters.dateField}
                      onChange={handleDateFieldChange}
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                    >
                      {DATE_FIELD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">С даты</span>
                    <input
                      type="date"
                      value={state.filters.dateFrom ?? ''}
                      onChange={handleDateFromChange}
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-xs uppercase tracking-wide text-neutral-500">По дату</span>
                    <input
                      type="date"
                      value={state.filters.dateTo ?? ''}
                      onChange={handleDateToChange}
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                    />
                  </label>
                </div>

                {/* Кнопки действий */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-900 pt-4">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-indigo-400/60 hover:text-white"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFiltersModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-full border border-indigo-400/60 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-indigo-400 hover:bg-indigo-500/30"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {actionError ? (
          <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {actionError}
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-10 text-center text-sm text-rose-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300"
            >
              <RefreshCw className="h-4 w-4" />
              Повторить загрузку
            </button>
          </div>
        ) : null}

        {showSkeletons ? (
          viewMode === 'grid' ? (
            <div className="cs-auto-grid gap-4" style={{ '--cs-grid-min': '200px' } as CSSProperties}>
              {Array.from({ length: GRID_SKELETON_COUNT }).map((_, index) => (
                <GridSkeletonCard key={`grid-skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: LIST_SKELETON_COUNT }).map((_, index) => (
                <ListSkeletonCard key={`list-skeleton-${index}`} />
              ))}
            </div>
          )
        ) : null}

        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-neutral-900/60 bg-neutral-950/60 p-12 text-center">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-white">У вас пока нет проектов</h2>
              <p className="text-sm text-neutral-400">
                Нажмите «Создать проект» или выберите шаблон, чтобы запустить первую инициативу.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/app/projects/create"
                className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Создать проект
              </Link>
              <Link
                href="/app/projects/templates"
                className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-100 transition hover:border-indigo-400/60 hover:text-white"
              >
                Выбрать шаблон
              </Link>
            </div>
          </div>
        ) : null}

        {!showSkeletons && !showEmptyState && !error ? (
          viewMode === 'grid' ? (
            <div className="cs-auto-grid gap-4" style={{ '--cs-grid-min': '200px' } as CSSProperties}>
              {projects.map((project) => (
                <ProjectGridCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onCreateTask={handleCreateTask}
                  onInvite={handleInvite}
                  onToggleArchive={handleToggleArchive}
                  actionInFlight={actionInFlight}
                />
              ))}
            </div>
          ) : shouldVirtualize ? (
            <div ref={listParentRef} className="max-h-[70vh] overflow-auto pr-2">
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const project = projects[virtualRow.index];
                  if (!project) {
                    return null;
                  }
                  return (
                    <div
                      key={project.id}
                      ref={rowVirtualizer.measureElement}
                      className="absolute left-0 top-0 w-full px-2"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <ProjectListCard
                        project={project}
                        onOpen={handleOpenProject}
                        onCreateTask={handleCreateTask}
                        onInvite={handleInvite}
                        onToggleArchive={handleToggleArchive}
                        actionInFlight={actionInFlight}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <ProjectListCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onCreateTask={handleCreateTask}
                  onInvite={handleInvite}
                  onToggleArchive={handleToggleArchive}
                  actionInFlight={actionInFlight}
                />
              ))}
            </div>
          )
        ) : null}

        {projects.length > 0 && !loading && !error ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-900 bg-neutral-950/60 px-6 py-4 text-sm text-neutral-400">
            <span>
              Показано {projects.length} из {total} проектов
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-4 py-2 font-semibold text-neutral-200 transition hover:border-indigo-400/60 hover:text-white"
            >
              <RefreshCw className={cn('h-4 w-4', loading ? 'animate-spin' : undefined)} />
              Обновить данные
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
