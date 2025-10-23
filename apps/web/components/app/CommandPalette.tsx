'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/ui/toast';
import { search, type SearchItem } from '@/lib/search/deepSearch';
import { useProjectContext } from '@/components/project/ProjectContext';
import { loadInvoices, loadProjects, loadTasks } from '@/lib/mock/loaders';

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

type PaletteResult = ReturnType<typeof search>;

const COMMAND_ITEMS: SearchItem[] = [
  {
    type: 'command',
    title: 'Открыть Маркетплейс',
    subtitle: 'Переход в общий каталог',
    tags: ['marketplace'],
    ref: '/app/marketplace/categories'
  },
  {
    type: 'command',
    title: 'Открыть каталог шаблонов',
    subtitle: 'Готовые решения для старта проекта',
    tags: ['marketplace', 'templates'],
    ref: '/app/marketplace/templates'
  },
  {
    type: 'command',
    title: 'Открыть пакеты услуг',
    subtitle: 'Форматные предложения команд и студий',
    tags: ['marketplace', 'services'],
    ref: '/app/marketplace/services'
  },
  {
    type: 'command',
    title: 'Открыть раздел исполнителей',
    subtitle: 'Каталог специалистов и команд',
    tags: ['performers', 'specialists'],
    ref: '/app/performers/specialists'
  },
  {
    type: 'command',
    title: 'Посмотреть вакансии исполнителей',
    subtitle: 'Актуальные запросы на специалистов',
    tags: ['performers', 'vacancies'],
    ref: '/app/performers/vacancies'
  },
  {
    type: 'command',
    title: 'Открыть маркетинговый обзор',
    subtitle: 'Цели, кампании и лиды',
    tags: ['marketing', 'overview'],
    ref: '/app/marketing/overview'
  },
  {
    type: 'command',
    title: 'Управление кампаниями',
    subtitle: 'Перейти к разделу «Кампании & Реклама»',
    tags: ['marketing', 'campaigns'],
    ref: '/app/marketing/campaigns'
  },
  {
    type: 'command',
    title: 'Контент и SEO',
    subtitle: 'Открыть контент-план и SEO-кластеры',
    tags: ['marketing', 'content'],
    ref: '/app/marketing/content-seo'
  }
];

function getTypeLabel(type: SearchItem['type']): string {
  if (type === 'command') {
    return 'команда';
  }
  return type;
}

const PROJECT_PARTICIPANTS: Record<string, { id: string; name: string; subtitle: string }[]> = {
  DEMO: [
    { id: 'user-founder', name: 'founder@demo.collabverse.ru', subtitle: 'FOUNDER · Инициатор проекта' },
    { id: 'user-pm', name: 'pm@demo.collabverse.ru', subtitle: 'PM · Управление задачами' },
    { id: 'user-designer', name: 'designer@demo.collabverse.ru', subtitle: 'Дизайнер · Бренд и UI' },
    { id: 'contractor-print', name: 'print.contractor@demo.collabverse.ru', subtitle: 'CONTRACTOR · Печать и мерч' }
  ]
};

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const projectContext = useProjectContext();
  const router = useRouter();

  const dataset = useMemo(() => {
    const allProjects = loadProjects();
    const allTasks = loadTasks();
    const allInvoices = loadInvoices();

    const projectItems: SearchItem[] = allProjects.map((project) => ({
      type: 'project',
      title: project.name,
      subtitle: project.status,
      tags: [project.code],
      ref: project.id,
      projectId: project.id
    }));

    const taskItems: SearchItem[] = allTasks.map((task) => ({
      type: 'task',
      title: `${task.title}`,
      subtitle: `${task.status} · ${task.projectId}`,
      tags: [task.projectId, task.id],
      ref: task.id,
      projectId: task.projectId
    }));

    const invoiceItems: SearchItem[] = allInvoices.map((invoice) => ({
      type: 'invoice',
      title: invoice.title,
      subtitle: `${invoice.amount.toLocaleString('ru-RU')} ${invoice.currency} · ${invoice.projectId}`,
      tags: [invoice.projectId, invoice.id],
      ref: invoice.id,
      projectId: invoice.projectId
    }));

    const participantItems: SearchItem[] = Object.entries(PROJECT_PARTICIPANTS).flatMap(([projectId, participants]) =>
      participants.map((participant) => ({
        type: 'user',
        title: participant.name,
        subtitle: participant.subtitle,
        tags: [projectId],
        ref: participant.id,
        projectId
      }))
    );

    if (projectContext) {
      return [
        ...COMMAND_ITEMS,
        ...projectItems.filter((item) => item.projectId === projectContext.projectId),
        ...taskItems.filter((item) => item.projectId === projectContext.projectId),
        ...invoiceItems.filter((item) => item.projectId === projectContext.projectId),
        ...participantItems.filter((item) => item.projectId === projectContext.projectId)
      ];
    }

    return [...COMMAND_ITEMS, ...projectItems, ...taskItems, ...invoiceItems, ...participantItems];
  }, [projectContext]);

  const projectId = projectContext?.projectId;

  const results: PaletteResult = useMemo(() => {
    const options = projectId ? { projectId } : {};
    return search(query, dataset, options);
  }, [dataset, projectId, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const target = results[activeIndex]?.item;
        if (target) {
          if (target.type === 'command') {
            router.push(target.ref);
            onClose();
            return;
          }
          toast(`TODO: открыть ${target.type} ${target.title}`);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeIndex, onClose, open, results, router]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const input = document.getElementById('command-input') as HTMLInputElement | null;
    input?.focus();
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-neutral-950/80 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Командная палитра"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-100">Командная палитра</h2>
            <p className="text-xs text-neutral-500">
              Маски: @ — участники и подрядчики, # — задачи, $ — счета.
            </p>
          </div>
          <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400">Esc</span>
        </div>
        <div className="mt-4">
          <label htmlFor="command-input" className="sr-only">
            Поле поиска по платформе
          </label>
          <input
            id="command-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Например: #12 или @demo"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
            autoComplete="off"
          />
        </div>
        <ul className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-neutral-800/60 bg-neutral-900/30">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-neutral-500">Ничего не найдено</li>
          )}
          {results.map((result, index) => {
            const item = result.item;
            const isActive = index === activeIndex;
            return (
              <li key={`${item.ref}-${index}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    if (item.type === 'command') {
                      router.push(item.ref);
                      onClose();
                      return;
                    }
                    toast(`TODO: открыть ${item.type} ${item.title}`);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                    isActive ? 'bg-indigo-500/10' : 'bg-transparent'
                  }`}
                >
                  <div>
                    <p className="font-medium text-neutral-100">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-neutral-500">{item.subtitle}</p>}
                  </div>
                  <span className="text-[11px] uppercase tracking-wide text-neutral-500">{getTypeLabel(item.type)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
