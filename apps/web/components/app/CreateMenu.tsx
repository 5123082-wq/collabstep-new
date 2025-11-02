'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/ui/toast';
import { useUiStore } from '@/lib/state/ui-store';
import { useProjectContext } from '@/components/project/ProjectContext';
import { loadProjects } from '@/lib/mock/loaders';
import type { Project } from '@/lib/schemas/project';
import { getUserRoles, type UserRole } from '@/lib/auth/roles';

type CreateMenuProps = {
  open: boolean;
  onClose: () => void;
};

type CreateAction = {
  id: string;
  label: string;
  description: string;
  toastMessage: string;
  requiresProject?: boolean;
  roles?: UserRole[];
};

const createActions: CreateAction[] = [
  {
    id: 'project',
    label: 'Проект',
    description: 'Запустить новый проект и команду.',
    toastMessage: 'TODO: Создать проект',
    roles: ['FOUNDER', 'PM', 'ADMIN']
  },
  { id: 'vacancy', label: 'Вакансию', description: 'Открыть позицию и собрать отклики.', toastMessage: 'TODO: Создать вакансию', requiresProject: true },
  { id: 'task', label: 'Задачу', description: 'Добавить задачу в план работ.', toastMessage: 'TODO: Создать задачу', requiresProject: true },
  { id: 'ai-session', label: 'AI-сессию', description: 'Запустить диалог с AI-ассистентом.', toastMessage: 'TODO: Открыть AI-сессию', requiresProject: true },
  { id: 'order', label: 'Заказ подрядчику', description: 'Оформить заказ на услуги подрядчика.', toastMessage: 'TODO: Создать заказ', requiresProject: true },
  { id: 'payment', label: 'Платёж/Счёт', description: 'Сформировать счёт или оплату.', toastMessage: 'TODO: Создать платёж', requiresProject: true }
];

export default function CreateMenu({ open, onClose }: CreateMenuProps) {
  const router = useRouter();
  const { lastProjectId, setLastProjectId } = useUiStore((state) => ({
    lastProjectId: state.lastProjectId,
    setLastProjectId: state.setLastProjectId
  }));
  const projectContext = useProjectContext();
  const projectOptions: Project[] = loadProjects();
  const roles = useMemo(() => getUserRoles(), []);

  const visibleActions = useMemo(() => {
    return createActions.filter((action) => {
      if (!action.roles) {
        return true;
      }
      return action.roles.some((role) => roles.includes(role));
    });
  }, [roles]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (projectContext) {
        setSelected(projectContext.projectId);
      } else {
        setSelected(lastProjectId ?? undefined);
      }
      setQuery('');
    }
  }, [lastProjectId, open, projectContext]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const term = query.trim().toLowerCase();
  const filteredProjects = term
    ? projectOptions.filter((project) => {
        const candidates = [project.name, project.code, project.status, project.stage, project.visibility];
        return candidates
          .map((field) => (field ? String(field).toLowerCase() : ''))
          .some((field) => field.includes(term));
      })
    : projectOptions;

  const handleAction = (action: CreateAction) => {
    const targetProjectId = projectContext?.projectId ?? selected;

    if (action.requiresProject && !targetProjectId) {
      toast('Выберите проект, чтобы продолжить', 'warning');
      return;
    }

    if (targetProjectId) {
      setLastProjectId(targetProjectId);
    }

    if (action.id === 'project') {
      onClose();
      router.push('/app/projects/create');
      return;
    }

    toast(action.toastMessage);
    onClose();
  };

  const selectedProject = (() => {
    const targetId = projectContext?.projectId ?? selected;
    if (!targetId) {
      return null;
    }

    return projectOptions.find((project) => project.id === targetId) ?? null;
  })();

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--surface-overlay)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-menu-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-popover)] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 id="create-menu-title" className="text-lg font-semibold text-[color:var(--text-primary)]">
              Меню создания
            </h2>
            <p className="mt-1 text-sm text-[color:var(--text-tertiary)]">Быстрые действия для запуска рабочей сессии.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--surface-border-subtle)] px-3 py-1 text-xs text-[color:var(--text-secondary)] transition hover:border-[color:var(--surface-border-strong)] hover:text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-label="Закрыть меню создания"
          >
            Esc
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-xs uppercase text-[color:var(--text-tertiary)]">Контекст проекта</span>
            <div className="mt-2 rounded-xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] p-4">
              {projectContext ? (
                <div>
                  <p className="text-sm font-semibold text-[color:var(--text-primary)]">{projectContext.projectName}</p>
                  <p className="mt-1 text-xs text-[color:var(--text-tertiary)]">
                    Стадия: {projectContext.stage} · {projectContext.visibility === 'public' ? 'Публичный' : 'Приватный'} проект
                  </p>
                </div>
              ) : selectedProject ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{selectedProject.name}</p>
                    <p className="text-xs text-[color:var(--text-tertiary)]">
                      {selectedProject.code} · {selectedProject.stage} ·{' '}
                      {selectedProject.visibility === 'public' ? 'Публичный' : 'Приватный'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(undefined)}
                    className="text-xs text-indigo-300 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                  >
                    Сменить
                  </button>
                </div>
              ) : (
                <div>
                  <label htmlFor="project-search" className="text-xs text-[color:var(--text-tertiary)]">
                    Найдите проект по названию, коду или стадии
                  </label>
                  <input
                    id="project-search"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-base)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-indigo-500 focus:outline-none"
                    placeholder="Например: DEMO"
                  />
                  <ul className="mt-3 max-h-32 space-y-2 overflow-y-auto pr-1 text-sm">
                    {filteredProjects.map((project) => (
                      <li key={project.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(project.id)}
                          className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-indigo-500/40 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                        >
                          <p className="font-medium text-[color:var(--text-primary)]">{project.name}</p>
                          <p className="text-xs text-[color:var(--text-tertiary)]">
                            {project.code} · {project.stage} · {project.visibility === 'public' ? 'Публичный' : 'Приватный'}
                          </p>
                        </button>
                      </li>
                    ))}
                    {filteredProjects.length === 0 && (
                      <li className="rounded-lg border border-dashed border-[color:var(--surface-border-subtle)] px-3 py-4 text-center text-xs text-[color:var(--text-tertiary)]">
                        Ничего не найдено
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {visibleActions.length > 0 ? (
              visibleActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleAction(action)}
                  className="flex h-full flex-col justify-between rounded-xl border border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] p-4 text-left transition hover:border-indigo-500/40 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">{action.label}</p>
                    <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">{action.description}</p>
                  </div>
                  {action.requiresProject && (
                    <p className="mt-3 text-[10px] uppercase tracking-wide text-[color:var(--text-tertiary)]">Нужен выбранный проект</p>
                  )}
                </button>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[color:var(--surface-border-subtle)] bg-[color:var(--surface-muted)] p-6 text-center text-xs text-[color:var(--text-tertiary)]">
                Доступные действия отсутствуют для вашей роли.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
