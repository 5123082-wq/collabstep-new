import type { Task, TaskStatus } from '@/domain/projects/types';

const DEFAULT_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done'];

type TemplateTaskBlueprint = {
  title: string;
  description?: string;
  status?: TaskStatus;
  labels?: string[];
  offsetStartDays?: number;
  offsetDueDays?: number;
};

type TemplateTasksMap = Record<string, TemplateTaskBlueprint[]>;

const TEMPLATE_TASKS: TemplateTasksMap = {
  'tpl-brand': [
    {
      title: 'Ресёрч аудитории',
      description: 'Собрать инсайты о целевой аудитории и конкурентах.',
      labels: ['research', 'brand'],
      status: 'new'
    },
    {
      title: 'Дизайн-концепция',
      description: 'Moodboard + визуальные референсы.',
      labels: ['design'],
      status: 'in_progress',
      offsetStartDays: 2
    },
    {
      title: 'Гайд по айдентике',
      description: 'Сверстать брендбук и подготовить экспорт.',
      labels: ['docs'],
      status: 'review',
      offsetStartDays: 7,
      offsetDueDays: 12
    }
  ],
  'tpl-landing': [
    {
      title: 'Информационная архитектура',
      description: 'Собрать контентные блоки и структуру лендинга.',
      labels: ['ux', 'landing'],
      status: 'new'
    },
    {
      title: 'Дизайн первой секции',
      description: 'Сделать hero-блок с оффером и CTA.',
      labels: ['design'],
      status: 'in_progress',
      offsetStartDays: 1
    },
    {
      title: 'Верстка и интеграция',
      description: 'Собрать адаптив и подключить форму заявки.',
      labels: ['dev'],
      status: 'review',
      offsetStartDays: 5,
      offsetDueDays: 9
    }
  ],
  'tpl-mkt': [
    {
      title: 'Продуктовый ресёрч',
      description: 'Интервью с пользователями и определение JTBD.',
      labels: ['research'],
      status: 'new'
    },
    {
      title: 'Контент-план',
      description: 'Подготовить темы и каналы дистрибуции.',
      labels: ['content'],
      status: 'in_progress',
      offsetStartDays: 1
    },
    {
      title: 'Запуск кампании',
      description: 'Настроить трекинг и запустить рекламные форматы.',
      labels: ['launch'],
      status: 'review',
      offsetStartDays: 6,
      offsetDueDays: 10
    }
  ],
  'tpl-product': [
    {
      title: 'Карта пользовательских сценариев',
      description: 'Зафиксировать основные шаги в кастдеве и CJM.',
      labels: ['ux', 'strategy'],
      status: 'new'
    },
    {
      title: 'Бэклог MVP',
      description: 'Разбить требования на задачи и оценить объём.',
      labels: ['backlog'],
      status: 'in_progress',
      offsetStartDays: 2
    },
    {
      title: 'План релизов',
      description: 'Определить релизные окна и владельцев.',
      labels: ['roadmap'],
      status: 'review',
      offsetStartDays: 5,
      offsetDueDays: 14
    }
  ]
};

function toISOString(date: Date) {
  return date.toISOString();
}

function addDays(base: Date, days: number) {
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

export function createTemplateTasks(templateId: string, projectId: string, now: Date): Task[] {
  const fallbackBlueprints = TEMPLATE_TASKS['tpl-product'] ?? [];
  const candidateBlueprints = TEMPLATE_TASKS[templateId];
  const blueprints =
    candidateBlueprints && candidateBlueprints.length > 0 ? candidateBlueprints : fallbackBlueprints;
  const createdAt = toISOString(now);
  const tasks: Task[] = [];

  for (const blueprint of blueprints) {
    const task: Task = {
      id: crypto.randomUUID(),
      projectId,
      parentId: null,
      title: blueprint.title,
      status: blueprint.status ?? 'new',
      labels: blueprint.labels ?? [],
      createdAt,
      updatedAt: createdAt
    };

    if (blueprint.description) {
      task.description = blueprint.description;
    }

    if (typeof blueprint.offsetStartDays === 'number') {
      task.startAt = toISOString(addDays(now, blueprint.offsetStartDays));
    }

    if (typeof blueprint.offsetDueDays === 'number') {
      task.dueAt = toISOString(addDays(now, blueprint.offsetDueDays));
    }

    tasks.push(task);
  }

  return tasks;
}

export { DEFAULT_STATUSES };
