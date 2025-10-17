export type RoadmapStageStatus = 'done' | 'in_progress' | 'planned';

export type RoadmapStageLink = {
  label: string;
  href: string;
};

export type RoadmapStage = {
  number: number;
  title: string;
  description: string;
  status: RoadmapStageStatus;
  links: RoadmapStageLink[];
};

export type RoadmapSectionId =
  | 'dashboard.widgets'
  | 'global.marketplace'
  | 'global.finance'
  | 'global.aiHub'
  | 'global.contractors'
  | 'global.admin'
  | 'global.search'
  | 'project.vacancies'
  | 'project.tasks'
  | 'project.team'
  | 'project.finance'
  | 'project.contractors'
  | 'project.ai'
  | 'project.analytics';

type SectionStageMeta = {
  range: string;
  stages: number[];
};

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    number: 5,
    title: 'Dev-Auth + демо-админ',
    description: 'Логин/разлогин в dev-режиме и упрощённая панель администратора для демо.',
    status: 'done',
    links: [{ label: 'Админ-панель', href: '/app/admin' }]
  },
  {
    number: 6,
    title: 'Маркетплейс v1',
    description: 'Каталоги специалистов и вакансий, фильтры и отклики в рамках витрины.',
    status: 'in_progress',
    links: [
      { label: 'Специалисты', href: '/app/marketplace/specialists' },
      { label: 'Вакансии', href: '/app/marketplace/vacancies' }
    ]
  },
  {
    number: 7,
    title: 'Профиль специалиста + публичная визитка',
    description: 'Редактор профиля, карточки компетенций и публикация публичной визитки.',
    status: 'planned',
    links: [
      { label: 'Профиль', href: '/app/profile' },
      { label: 'Публичная карточка', href: '/app/profile/card' }
    ]
  },
  {
    number: 8,
    title: 'Вакансии в проектах + задачи (скелет)',
    description: 'Доски задач внутри проекта и вакансии с откликами в рабочем пространстве.',
    status: 'planned',
    links: [
      { label: 'Проект · Вакансии', href: '/project/DEMO/vacancies' },
      { label: 'Проект · Задачи', href: '/project/DEMO/tasks' }
    ]
  },
  {
    number: 9,
    title: 'Организации/Планы/Места (UI-правила)',
    description: 'Матрица команд, планирование площадок и шаблоны процессов.',
    status: 'planned',
    links: [
      { label: 'Организация · Команда', href: '/app/org/team' },
      { label: 'Шаблоны процессов', href: '/app/org/process-templates' }
    ]
  },
  {
    number: 10,
    title: 'Финансы v1 (кошелёк/инвойсы/эскроу, Stripe test)',
    description: 'Единый кошелёк, выставление счетов, эскроу и тестовые платежи Stripe.',
    status: 'planned',
    links: [
      { label: 'Финансы', href: '/app/finance/wallet' },
      { label: 'Проект · Финансы', href: '/project/DEMO/finance' }
    ]
  },
  {
    number: 11,
    title: 'Подрядчики (сметы/заказы, статусы)',
    description: 'Каталог подрядчиков, сметы, статусы заказов и контроль документооборота.',
    status: 'planned',
    links: [
      { label: 'Маркетплейс · Подрядчики', href: '/app/marketplace/contractors' },
      { label: 'Проект · Подрядчики', href: '/project/DEMO/contractors' }
    ]
  },
  {
    number: 12,
    title: 'AI-Hub минимальный (генерации на mock-адаптере)',
    description: 'Единый центр AI-сессий и генераций с mock-адаптером для контента.',
    status: 'planned',
    links: [
      { label: 'AI-Hub', href: '/app/ai-hub/generations' },
      { label: 'Проект · AI', href: '/project/DEMO/ai' }
    ]
  },
  {
    number: 13,
    title: 'Поиск/⌘K глубокий',
    description: 'Глобальная палитра команд, расширенный поиск по объектам и ролям.',
    status: 'planned',
    links: [{ label: 'Командная палитра', href: '/app/dashboard' }]
  },
  {
    number: 14,
    title: 'Админка/модерация',
    description: 'Глобальное модераторское рабочее место, политики и очереди запросов.',
    status: 'planned',
    links: [{ label: 'Админ-панель', href: '/app/admin' }]
  },
  {
    number: 15,
    title: 'Хардненинг/качество',
    description: 'Нагрузочное тестирование, аудит качества и финальная подготовка к запуску.',
    status: 'planned',
    links: [{ label: 'Поддержка', href: '/app/support/tickets' }]
  }
];

const SECTION_STAGE_MAP: Record<RoadmapSectionId, SectionStageMeta> = {
  'dashboard.widgets': { range: '8–10', stages: [8, 9, 10] },
  'global.marketplace': { range: '6', stages: [6] },
  'global.finance': { range: '10', stages: [10] },
  'global.aiHub': { range: '12', stages: [12] },
  'global.contractors': { range: '11', stages: [11] },
  'global.admin': { range: '14', stages: [14] },
  'global.search': { range: '13', stages: [13] },
  'project.vacancies': { range: '8–9', stages: [8, 9] },
  'project.tasks': { range: '8–9', stages: [8, 9] },
  'project.team': { range: '8–9', stages: [8, 9] },
  'project.finance': { range: '10', stages: [10] },
  'project.contractors': { range: '11', stages: [11] },
  'project.ai': { range: '12', stages: [12] },
  'project.analytics': { range: '10–11', stages: [10, 11] }
};

export function getStageRangeFor(sectionId: RoadmapSectionId): string {
  return SECTION_STAGE_MAP[sectionId]?.range ?? '—';
}

export function getStageNumbers(sectionId: RoadmapSectionId): number[] {
  return SECTION_STAGE_MAP[sectionId]?.stages ?? [];
}

export function isStageDone(stageNumber: number): boolean {
  const stage = ROADMAP_STAGES.find((item) => item.number === stageNumber);
  return stage?.status === 'done';
}
