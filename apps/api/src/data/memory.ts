import type { Iteration, Project, ProjectTemplate, ProjectWorkflow, Task } from '../types';

export const memory = {
  PROJECTS: [
    {
      id: 'proj-admin-onboarding',
      title: 'Онбординг команды Collabstep',
      description: 'Первые шаги команды после запуска платформы.',
      ownerId: 'admin',
      stage: 'design',
      archived: false,
      createdAt: '2024-05-01T08:30:00.000Z',
      updatedAt: '2024-06-10T12:15:00.000Z'
    },
    {
      id: 'proj-admin-landing-archive',
      title: 'Редизайн лендинга (архив)',
      description: 'Завершённая инициатива по обновлению главной страницы.',
      ownerId: 'admin',
      stage: 'launch',
      archived: true,
      createdAt: '2023-11-05T10:00:00.000Z',
      updatedAt: '2024-01-20T17:45:00.000Z'
    }
  ] as Project[],
  TASKS: [
    {
      id: 'task-admin-brief',
      projectId: 'proj-admin-onboarding',
      title: 'Подготовить бриф и дорожную карту',
      description: 'Сформировать цели, KPI и ритуалы команды.',
      status: 'in_progress',
      assigneeId: 'admin',
      labels: ['Стратегия', 'Команда'],
      createdAt: '2024-05-02T09:00:00.000Z',
      updatedAt: '2024-06-08T14:20:00.000Z'
    },
    {
      id: 'task-admin-design',
      projectId: 'proj-admin-onboarding',
      title: 'Собрать дизайн-концепты',
      description: 'Подготовить варианты визуального языка продукта.',
      status: 'review',
      assigneeId: 'designer-1',
      labels: ['Дизайн'],
      createdAt: '2024-05-12T11:00:00.000Z',
      updatedAt: '2024-06-09T10:30:00.000Z'
    }
  ] as Task[],
  WORKFLOWS: {
    'proj-admin-onboarding': {
      projectId: 'proj-admin-onboarding',
      statuses: ['new', 'in_progress', 'review', 'done']
    }
  } as Record<string, ProjectWorkflow>,
  ITERATIONS: [
    {
      id: 'iter-admin-onboarding-sprint-1',
      projectId: 'proj-admin-onboarding',
      title: 'Спринт 1: Запуск команды',
      start: '2024-05-06',
      end: '2024-05-17'
    }
  ] as Iteration[],
  TEMPLATES: [
    {
      id: 'tpl-admin-discovery',
      title: 'Админский discovery',
      kind: 'product',
      summary: 'Скрипты интервью, CJM и гипотезы для старта команды.'
    },
    { id: 'tpl-brand', title: 'Бренд-пакет', kind: 'brand', summary: 'Нейминг, айдентика, гайд' },
    { id: 'tpl-landing', title: 'Лендинг', kind: 'landing', summary: 'Одностраничник с формой' },
    { id: 'tpl-mkt', title: 'Маркетинг', kind: 'marketing', summary: 'Кампания + контент-план' },
    { id: 'tpl-product', title: 'Digital-продукт', kind: 'product', summary: 'MVP флоу + бэклог' }
  ] as ProjectTemplate[]
};
