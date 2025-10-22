'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TopSubmenu from '@/components/app/TopSubmenu';
import type { ProjectStage } from '@/domain/projects/types';
import {
  useProjectCatalogStore,
  type CatalogProject,
  type CatalogTab,
  type CatalogTemplate
} from '@/stores/projectCatalog';

const TAB_OPTIONS: { key: CatalogTab; label: string }[] = [
  { key: 'my', label: 'Мои проекты' },
  { key: 'templates', label: 'Шаблоны' },
  { key: 'archive', label: 'Архив' }
];

type SortOption = 'updated-desc' | 'updated-asc' | 'title-asc' | 'title-desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'updated-desc', label: 'Сначала обновлённые' },
  { value: 'updated-asc', label: 'Сначала старые' },
  { value: 'title-asc', label: 'По названию (А → Я)' },
  { value: 'title-desc', label: 'По названию (Я → А)' }
];

const STAGE_LABELS: Record<ProjectStage, string> = {
  discovery: 'Discovery',
  design: 'Дизайн',
  build: 'Разработка',
  launch: 'Запуск',
  support: 'Сопровождение'
};

const TEMPLATE_KIND_LABELS: Record<string, string> = {
  brand: 'Бренд',
  landing: 'Лендинг',
  marketing: 'Маркетинг',
  product: 'Продукт'
};

function parseTab(value?: string | null): CatalogTab {
  if (value === 'templates' || value === 'archive') {
    return value;
  }
  return 'my';
}

function formatDate(value: string) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (err) {
    console.error(err);
    return '—';
  }
}

function formatTasks(count: number) {
  return new Intl.NumberFormat('ru-RU').format(count);
}

function normalizeProject(data: unknown): CatalogProject | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  const title = typeof record.title === 'string' ? record.title : null;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : null;
  const rawStage = typeof record.stage === 'string' ? (record.stage as ProjectStage) : null;
  const tasksCount =
    typeof record.tasksCount === 'number' && Number.isFinite(record.tasksCount)
      ? record.tasksCount
      : 0;
  const labels = Array.isArray(record.labels)
    ? record.labels.filter((item): item is string => typeof item === 'string')
    : [];
  const archived = record.archived === true;

  if (!id || !title || !updatedAt) {
    return null;
  }

  return {
    id,
    title,
    stage: rawStage ?? null,
    updatedAt,
    tasksCount,
    labels,
    archived
  };
}

function normalizeTemplate(data: unknown): CatalogTemplate | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  const record = data as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id : null;
  const title = typeof record.title === 'string' ? record.title : null;
  const kind = typeof record.kind === 'string' ? record.kind : null;
  const summary = typeof record.summary === 'string' ? record.summary : '';

  if (!id || !title || !kind) {
    return null;
  }

  return { id, title, kind, summary };
}

type ProjectsIndexPageClientProps = {
  initialTab?: string;
};

export default function ProjectsIndexPageClient({ initialTab }: ProjectsIndexPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = useProjectCatalogStore((state) => state.activeTab);
  const setActiveTab = useProjectCatalogStore((state) => state.setActiveTab);
  const message = useProjectCatalogStore((state) => state.message);
  const setMessage = useProjectCatalogStore((state) => state.setMessage);
  const attachModal = useProjectCatalogStore((state) => state.attachModal);
  const openAttachModal = useProjectCatalogStore((state) => state.openAttachModal);
  const closeAttachModal = useProjectCatalogStore((state) => state.closeAttachModal);
  const updateAttachModal = useProjectCatalogStore((state) => state.updateAttachModal);
  const resetUiState = useProjectCatalogStore((state) => state.reset);

  const [projects, setProjects] = useState<CatalogProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CatalogTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [sort, setSort] = useState<SortOption>('updated-desc');
  const [activeProjectsCache, setActiveProjectsCache] = useState<CatalogProject[]>([]);

  useEffect(() => {
    resetUiState();
  }, [resetUiState]);

  useEffect(() => {
    const fromQuery = searchParams?.get('tab') ?? initialTab ?? null;
    const parsed = parseTab(fromQuery);
    if (parsed !== tab) {
      setActiveTab(parsed);
    }
  }, [initialTab, searchParams, setActiveTab, tab]);

  const applyTabToRouter = useCallback(
    (next: CatalogTab) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (next === 'my') {
        params.delete('tab');
      } else {
        params.set('tab', next);
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`);
    },
    [pathname, router, searchParams]
  );

  const handleSelectTab = useCallback(
    (next: CatalogTab) => {
      if (next === tab) {
        return;
      }
      setActiveTab(next);
      applyTabToRouter(next);
    },
    [applyTabToRouter, setActiveTab, tab]
  );

  const fetchProjects = useCallback(
    async (targetTab: CatalogTab, signal?: AbortSignal) => {
      const endpoint = targetTab === 'archive' ? '/api/projects/archive' : '/api/projects/active';
      const init: RequestInit = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        ...(signal ? { signal } : {})
      };
      const response = await fetch(endpoint, init);

      if (!response.ok) {
        throw new Error('Не удалось загрузить проекты');
      }

      const payload = (await response.json()) as { items?: unknown };
      const rawItems = Array.isArray(payload.items) ? payload.items : [];
      const normalized: CatalogProject[] = [];
      for (const item of rawItems) {
        const candidate = normalizeProject(item);
        if (candidate) {
          normalized.push(candidate);
        }
      }
      return normalized;
    },
    []
  );

  const fetchTemplates = useCallback(async (signal?: AbortSignal) => {
    const init: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      ...(signal ? { signal } : {})
    };
    const response = await fetch('/api/templates', init);

    if (!response.ok) {
      throw new Error('Не удалось загрузить шаблоны');
    }

    const payload = (await response.json()) as { items?: unknown };
    const rawItems = Array.isArray(payload.items) ? payload.items : [];
    const normalized: CatalogTemplate[] = [];
    for (const item of rawItems) {
      const candidate = normalizeTemplate(item);
      if (candidate) {
        normalized.push(candidate);
      }
    }
    return normalized;
  }, []);

  const loadProjects = useCallback(
    async (targetTab: CatalogTab) => {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const items = await fetchProjects(targetTab);
        setProjects(items);
        if (targetTab === 'my') {
          setActiveProjectsCache(items);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error(err);
        setProjectsError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setProjectsLoading(false);
      }
    },
    [fetchProjects]
  );

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setProjectsLoading(true);
    setProjectsError(null);
    fetchProjects(tab, controller.signal)
      .then((items) => {
        if (!active) {
          return;
        }
        setProjects(items);
        if (tab === 'my') {
          setActiveProjectsCache(items);
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error(err);
        if (active) {
          setProjectsError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        }
      })
      .finally(() => {
        if (active) {
          setProjectsLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchProjects, tab]);

  useEffect(() => {
    if (tab !== 'templates') {
      return;
    }
    let active = true;
    const controller = new AbortController();
    setTemplatesLoading(true);
    setTemplatesError(null);
    fetchTemplates(controller.signal)
      .then((items) => {
        if (!active) {
          return;
        }
        setTemplates(items);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error(err);
        if (active) {
          setTemplatesError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        }
      })
      .finally(() => {
        if (active) {
          setTemplatesLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchTemplates, tab]);

  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) {
      if (project.stage && !map.has(project.stage)) {
        map.set(project.stage, STAGE_LABELS[project.stage] ?? project.stage);
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [projects]);

  const labelOptions = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) {
      for (const label of project.labels) {
        set.add(label);
      }
    }
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const searchLower = search.trim().toLowerCase();
    const stageValue = stageFilter === 'all' ? null : stageFilter;
    const labelValue = labelFilter === 'all' ? null : labelFilter;
    const items = projects.filter((project) => {
      if (searchLower && !project.title.toLowerCase().includes(searchLower)) {
        return false;
      }
      if (stageValue && project.stage !== stageValue) {
        return false;
      }
      if (labelValue && !project.labels.includes(labelValue)) {
        return false;
      }
      return true;
    });

    const sorted = [...items];
    switch (sort) {
      case 'updated-asc':
        sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
        break;
      default:
        sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }

    return sorted;
  }, [labelFilter, projects, search, sort, stageFilter]);

  const ensureActiveProjects = useCallback(async () => {
    if (activeProjectsCache.length > 0) {
      return activeProjectsCache;
    }
    try {
      const items = await fetchProjects('my');
      setActiveProjectsCache(items);
      return items;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [activeProjectsCache, fetchProjects]);

  const handleOpenAttachModal = useCallback(
    async (template: CatalogTemplate) => {
      try {
        const items = await ensureActiveProjects();
        if (items.length === 0) {
          setMessage('Нет активных проектов для прикрепления шаблона');
          return;
        }
        openAttachModal({
          template,
          projectId: items[0]?.id ?? '',
          projectOptions: items
        });
      } catch (err) {
        setMessage('Не удалось загрузить список проектов');
      }
    },
    [ensureActiveProjects, openAttachModal, setMessage]
  );

  const handleArchive = useCallback(
    async (projectId: string) => {
      if (!window.confirm('Переместить проект в архив?')) {
        return;
      }
      try {
        const response = await fetch(`/api/projects/${projectId}/archive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Не удалось архивировать проект');
        }
        setMessage('Проект перемещён в архив');
        await loadProjects(tab);
      } catch (err) {
        console.error(err);
        setMessage(err instanceof Error ? err.message : 'Не удалось архивировать проект');
      }
    },
    [loadProjects, setMessage, tab]
  );

  const handleUnarchive = useCallback(
    async (projectId: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}/unarchive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Не удалось восстановить проект');
        }
        setMessage('Проект восстановлен');
        await loadProjects(tab);
      } catch (err) {
        console.error(err);
        setMessage(err instanceof Error ? err.message : 'Не удалось восстановить проект');
      }
    },
    [loadProjects, setMessage, tab]
  );

  const handleDelete = useCallback(
    async (projectId: string) => {
      if (!window.confirm('Удалить проект навсегда?')) {
        return;
      }
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Не удалось удалить проект');
        }
        setMessage('Проект удалён');
        await loadProjects(tab);
      } catch (err) {
        console.error(err);
        setMessage(err instanceof Error ? err.message : 'Не удалось удалить проект');
      }
    },
    [loadProjects, setMessage, tab]
  );

  const handleCreateFromTemplate = useCallback(async (template: CatalogTemplate) => {
    const title = window.prompt('Название нового проекта', template.title) ?? '';
    if (!title.trim()) {
      return;
    }
    try {
      const response = await fetch('/api/projects/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, title: title.trim() })
      });
      if (!response.ok) {
        throw new Error('Не удалось создать проект из шаблона');
      }
      const payload = (await response.json()) as { id?: string };
      const projectId = typeof payload.id === 'string' ? payload.id : null;
      setMessage('Проект создан из шаблона');
      await loadProjects(tab);
      if (projectId) {
        window.location.href = `/project/${projectId}`;
      }
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : 'Не удалось создать проект из шаблона');
    }
  }, [loadProjects, setMessage, tab]);

  const handleAttachTemplate = useCallback(async () => {
    if (!attachModal.open || !attachModal.template) {
      return;
    }
    if (!attachModal.projectId) {
      updateAttachModal({ error: 'Выберите проект' });
      return;
    }
    updateAttachModal({ isSubmitting: true, error: null });
    try {
      const response = await fetch(`/api/projects/${attachModal.projectId}/templates/attach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: attachModal.template.id })
      });
      if (!response.ok) {
        throw new Error('Не удалось прикрепить шаблон');
      }
      setMessage('Шаблон прикреплён к проекту');
      closeAttachModal();
    } catch (err) {
      console.error(err);
      updateAttachModal({
        isSubmitting: false,
        error: err instanceof Error ? err.message : 'Ошибка'
      });
    }
  }, [attachModal, closeAttachModal, setMessage, updateAttachModal]);

  const renderProjectsList = () => {
    if (projectsLoading) {
      return <p className="text-sm text-neutral-400">Загружаем проекты…</p>;
    }
    if (projectsError) {
      return <p className="text-sm text-red-400">{projectsError}</p>;
    }
    if (filteredProjects.length === 0) {
      return <p className="text-sm text-neutral-500">Проекты не найдены.</p>;
    }
    return (
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href={`/project/${project.id}`} className="text-base font-semibold text-white hover:text-indigo-300">
                  {project.title}
                </Link>
                {project.stage ? (
                  <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs text-neutral-400">
                    {STAGE_LABELS[project.stage] ?? project.stage}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-neutral-500">Обновлён: {formatDate(project.updatedAt)}</p>
              <p className="text-xs text-neutral-500">Задач: {formatTasks(project.tasksCount)}</p>
              {project.labels.length ? (
                <p className="text-xs text-neutral-500">
                  Метки: {project.labels.map((label) => (
                    <span key={label} className="mr-2 inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-200">
                      #{label}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/project/${project.id}/tasks`}
                className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-400 hover:text-indigo-100"
              >
                Открыть задачи
              </Link>
              <Link
                href={`/project/${project.id}/settings`}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:text-white"
              >
                Настройки
              </Link>
              {!project.archived ? (
                <button
                  type="button"
                  onClick={() => handleArchive(project.id)}
                  className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:border-red-400 hover:text-red-200"
                >
                  Архивировать
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUnarchive(project.id)}
                  className="rounded-xl border border-green-500/30 px-4 py-2 text-sm font-medium text-green-300 hover:border-green-400 hover:text-green-200"
                >
                  Восстановить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderArchiveList = () => {
    if (projectsLoading) {
      return <p className="text-sm text-neutral-400">Загружаем архив…</p>;
    }
    if (projectsError) {
      return <p className="text-sm text-red-400">{projectsError}</p>;
    }
    if (filteredProjects.length === 0) {
      return <p className="text-sm text-neutral-500">В архиве пока пусто.</p>;
    }
    return (
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="text-base font-semibold text-white">{project.title}</p>
              <p className="text-xs text-neutral-500">Обновлён: {formatDate(project.updatedAt)}</p>
              <p className="text-xs text-neutral-500">Задач: {formatTasks(project.tasksCount)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUnarchive(project.id)}
                className="rounded-xl border border-green-500/30 px-4 py-2 text-sm font-medium text-green-300 hover:border-green-400 hover:text-green-100"
              >
                Восстановить
              </button>
              <button
                type="button"
                onClick={() => handleDelete(project.id)}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-medium text-red-200 hover:border-red-400 hover:text-red-100"
              >
                Удалить навсегда
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTemplates = () => {
    if (templatesLoading) {
      return <p className="text-sm text-neutral-400">Загружаем каталог шаблонов…</p>;
    }
    if (templatesError) {
      return <p className="text-sm text-red-400">{templatesError}</p>;
    }
    if (templates.length === 0) {
      return <p className="text-sm text-neutral-500">Шаблоны пока не добавлены.</p>;
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.id} className="flex h-full flex-col justify-between rounded-2xl border border-neutral-900 bg-neutral-950/70 p-5">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wide text-indigo-200">
                {TEMPLATE_KIND_LABELS[template.kind] ?? template.kind}
              </span>
              <h3 className="text-lg font-semibold text-white">{template.title}</h3>
              <p className="text-sm text-neutral-400">{template.summary}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCreateFromTemplate(template)}
                className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-indigo-400 hover:text-indigo-100"
              >
                Создать проект
              </button>
              <button
                type="button"
                onClick={() => handleOpenAttachModal(template)}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:text-white"
              >
                Прикрепить к проекту…
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (tab) {
      case 'templates':
        return renderTemplates();
      case 'archive':
        return renderArchiveList();
      default:
        return renderProjectsList();
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Проекты</p>
          <h1 className="text-3xl font-semibold text-white">Центр проектов</h1>
          <p className="text-sm text-neutral-400">
            Управляйте своими инициативами, запускайте проекты по шаблонам и держите архив в порядке.
          </p>
        </div>
        <Link
          href="/project/new"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          + Новый проект
        </Link>
      </header>

      <TopSubmenu
        ariaLabel="Разделы каталога проектов"
        items={TAB_OPTIONS.map((option) => ({
          id: option.key,
          label: option.label,
          active: tab === option.key,
          onSelect: () => handleSelectTab(option.key)
        }))}
      />

      {tab !== 'templates' ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/50 p-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <label className="flex w-full flex-col gap-1 md:w-1/2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Поиск</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Название проекта"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
            </label>
            <label className="flex w-full flex-col gap-1 md:w-1/4">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Стадия</span>
              <select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">Все</option>
                {stageOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex w-full flex-col gap-1 md:w-1/4">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Метка</span>
              <select
                value={labelFilter}
                onChange={(event) => setLabelFilter(event.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                <option value="all">Все</option>
                {labelOptions.map((item) => (
                  <option key={item} value={item}>
                    #{item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex w-full flex-col gap-1 md:w-1/4">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Сортировка</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
            >
              {SORT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-200">
          {message}
        </div>
      ) : null}

      {renderContent()}

      {attachModal.open && attachModal.template ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Прикрепить шаблон</h2>
              <p className="text-sm text-neutral-400">{attachModal.template.title}</p>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Проект</span>
              <select
                value={attachModal.projectId}
                onChange={(event) => updateAttachModal({ projectId: event.target.value, error: null })}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                {attachModal.projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>
            {attachModal.error ? <p className="text-sm text-red-400">{attachModal.error}</p> : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAttachModal}
                className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-white"
                disabled={attachModal.isSubmitting}
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleAttachTemplate}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
                disabled={attachModal.isSubmitting}
              >
                {attachModal.isSubmitting ? 'Прикрепляем…' : 'Прикрепить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
