'use client';

import { useEffect, useMemo, useState } from 'react';
import projectsData from '@/app/mock/projects.json';
import { toast } from '@/lib/ui/toast';
import { useUiStore } from '@/lib/state/ui-store';
import { useProjectContext } from '@/components/project/ProjectContext';

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
};

const createActions: CreateAction[] = [
  { id: 'project', label: 'Проект', description: 'Запустить новый проект и команду.', toastMessage: 'TODO: Создать проект' },
  { id: 'vacancy', label: 'Вакансию', description: 'Открыть позицию и собрать отклики.', toastMessage: 'TODO: Создать вакансию', requiresProject: true },
  { id: 'task', label: 'Задачу', description: 'Добавить задачу в план работ.', toastMessage: 'TODO: Создать задачу', requiresProject: true },
  { id: 'ai-session', label: 'AI-сессию', description: 'Запустить диалог с AI-ассистентом.', toastMessage: 'TODO: Открыть AI-сессию', requiresProject: true },
  { id: 'order', label: 'Заказ подрядчику', description: 'Оформить заказ на услуги подрядчика.', toastMessage: 'TODO: Создать заказ', requiresProject: true },
  { id: 'payment', label: 'Платёж/Счёт', description: 'Сформировать счёт или оплату.', toastMessage: 'TODO: Создать платёж', requiresProject: true }
];

type ProjectOption = {
  id: string;
  name: string;
  code: string;
  status: string;
  stage: string;
  visibility: 'private' | 'public';
};

const projectOptions = projectsData as ProjectOption[];

export default function CreateMenu({ open, onClose }: CreateMenuProps) {
  const { lastProjectId, setLastProjectId } = useUiStore((state) => ({
    lastProjectId: state.lastProjectId,
    setLastProjectId: state.setLastProjectId
  }));
  const projectContext = useProjectContext();

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

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return projectOptions;
    }

    return projectOptions.filter((project) => {
      const candidates = [project.name, project.code, project.status, project.stage, project.visibility];
      return candidates
        .map((field) => (field ? String(field).toLowerCase() : ''))
        .some((field) => field.includes(term));
    });
  }, [query]);

  const handleAction = (action: CreateAction) => {
    const targetProjectId = projectContext?.projectId ?? selected;

    if (action.requiresProject && !targetProjectId) {
      toast('Выберите проект, чтобы продолжить', 'warning');
      return;
    }

    if (targetProjectId) {
      setLastProjectId(targetProjectId);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Меню создания"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold">Создать</h2>
            <p className="mt-1 text-sm text-neutral-400">Быстрые действия для запуска рабочей сессии.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-neutral-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            aria-label="Закрыть меню создания"
          >
            Esc
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <span className="text-xs uppercase text-neutral-500">Контекст проекта</span>
            <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              {projectContext ? (
                <div>
                  <p className="text-sm font-semibold text-neutral-100">{projectContext.projectName}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Стадия: {projectContext.stage} · {projectContext.visibility === 'public' ? 'Публичный' : 'Приватный'} проект
                  </p>
                </div>
              ) : selectedProject ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-100">{selectedProject.name}</p>
                    <p className="text-xs text-neutral-400">
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
                  <label htmlFor="project-search" className="text-xs text-neutral-400">
                    Найдите проект по названию, коду или стадии
                  </label>
                  <input
                    id="project-search"
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
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
                          <p className="font-medium text-neutral-100">{project.name}</p>
                          <p className="text-xs text-neutral-400">
                            {project.code} · {project.stage} · {project.visibility === 'public' ? 'Публичный' : 'Приватный'}
                          </p>
                        </button>
                      </li>
                    ))}
                    {filteredProjects.length === 0 && (
                      <li className="rounded-lg border border-dashed border-neutral-800 px-3 py-4 text-center text-xs text-neutral-500">
                        Ничего не найдено
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {createActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action)}
                className="flex h-full flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-left transition hover:border-indigo-500/40 hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-100">{action.label}</p>
                  <p className="mt-2 text-xs text-neutral-400">{action.description}</p>
                </div>
                {action.requiresProject && (
                  <p className="mt-3 text-[10px] uppercase tracking-wide text-neutral-500">Нужен выбранный проект</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
