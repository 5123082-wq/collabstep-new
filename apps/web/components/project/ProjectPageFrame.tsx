'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useProjectContext } from '@/components/project/ProjectContext';

const PROJECT_PAGE_METADATA: Record<string, { label: string; description?: string }> = {
  overview: {
    label: 'Обзор проекта',
    description: 'Сводка статуса, ключевые показатели и риски проекта.'
  },
  brief: {
    label: 'Бриф и вводные',
    description: 'Контекст, цели и ключевые вводные для команды.'
  },
  tasks: {
    label: 'Задачи и дорожки',
    description: 'Управление рабочими процессами, дорожками и итерациями.'
  },
  calendar: {
    label: 'Календарь и планирование',
    description: 'Дорожная карта, события и синхронизации команды.'
  },
  team: {
    label: 'Команда и роли',
    description: 'Состав команды, роли и совместные ритуалы.'
  },
  docs: {
    label: 'Документы и файлы',
    description: 'Хранилище юридических материалов, брендбука и доступов.'
  },
  design: {
    label: 'Дизайн и прототипы',
    description: 'Айдентика, макеты и материалы для производства.'
  },
  web: {
    label: 'Сайт и разработка',
    description: 'Статус репозитория, страницы продукта и дефекты.'
  },
  marketing: {
    label: 'Маркетинг и GTM',
    description: 'Сегменты аудитории, кампании и контент-календарь.'
  },
  vacancies: {
    label: 'Вакансии и подбор',
    description: 'Открытые роли, воронка подбора и кандидаты.'
  },
  contractors: {
    label: 'Подрядчики и партнёры',
    description: 'Каталог подрядчиков, заказы и договоры.'
  },
  finance: {
    label: 'Финансы и бюджеты',
    description: 'Бюджет, эскроу и финансовые документы проекта.'
  },
  timeline: {
    label: 'Таймлайн и дорожная карта',
    description: 'Ключевые события, вехи и контроль сроков.'
  },
  analytics: {
    label: 'Аналитика и отчёты',
    description: 'Метрики продукта, воронки и экспорт отчётности.'
  },
  automations: {
    label: 'Автоматизации',
    description: 'Правила, боты и библиотека готовых сценариев.'
  },
  modules: {
    label: 'CRM-модули',
    description: 'Конструктор возможностей будущей рабочей среды.'
  },
  integrations: {
    label: 'Интеграции и экосистема',
    description: 'Подключения, маркетплейс и управление API-ключами.'
  },
  ai: {
    label: 'AI и ассистенты',
    description: 'AI-сессии, история генераций и промпты.'
  },
  settings: {
    label: 'Настройки проекта',
    description: 'Общие параметры, интеграции и безопасность.'
  }
};

function formatFallbackLabel(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type ProjectPageFrameProps = {
  slug: string;
  title?: string | null;
  description?: string | null;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export default function ProjectPageFrame({
  slug,
  title,
  description,
  actions,
  filters,
  children,
  contentClassName
}: ProjectPageFrameProps) {
  const context = useProjectContext();
  const meta = useMemo(() => PROJECT_PAGE_METADATA[slug] ?? null, [slug]);
  const resolvedLabel = meta?.label ?? formatFallbackLabel(slug);
  const resolvedDescription = description ?? meta?.description ?? null;
  const resolvedTitle = title ?? context?.projectName ?? null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-neutral-900 bg-neutral-950/70 p-6 shadow-[0_0_30px_rgba(0,0,0,0.25)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{resolvedLabel}</p>
            {resolvedTitle ? <h1 className="text-3xl font-semibold text-white">{resolvedTitle}</h1> : null}
            {resolvedDescription ? (
              <p className="text-sm text-neutral-400">{resolvedDescription}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
        {filters ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
            {filters}
          </div>
        ) : null}
      </section>
      <div className={clsx('space-y-8', contentClassName)}>{children}</div>
    </div>
  );
}
