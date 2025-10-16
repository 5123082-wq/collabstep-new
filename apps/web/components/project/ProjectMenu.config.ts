import type { UserRole } from '@/lib/auth/roles';

export type ProjectMenuTab = {
  id: string;
  label: string;
};

export type ProjectMenuItem = {
  id: string;
  label: string;
  slug: string;
  description: string;
  roles?: UserRole[];
  tabs: ProjectMenuTab[];
};

const baseMenu: ProjectMenuItem[] = [
  {
    id: 'overview',
    label: 'Обзор',
    slug: 'overview',
    description: 'Статус проекта и контроль точек роста.',
    tabs: [
      { id: 'stages', label: 'Карта стадий' },
      { id: 'kpi', label: 'KPI / Сроки / Бюджет' },
      { id: 'risks', label: 'Риски' }
    ]
  },
  {
    id: 'brief',
    label: 'Бриф',
    slug: 'brief',
    description: 'Исходные данные и цели проекта.',
    tabs: [
      { id: 'summary', label: 'Ключевые тезисы' },
      { id: 'audience', label: 'Целевая аудитория' },
      { id: 'success', label: 'Критерии успеха' }
    ]
  },
  {
    id: 'team',
    label: 'Команда & Роли',
    slug: 'team',
    description: 'Состав команды, роли и зоны ответственности.',
    tabs: [
      { id: 'core-team', label: 'Ядро команды' },
      { id: 'roles', label: 'Роли и доступы' },
      { id: 'activity', label: 'Активность' }
    ]
  },
  {
    id: 'vacancies',
    label: 'Вакансии',
    slug: 'vacancies',
    description: 'Открытые позиции и отклики кандидатов.',
    tabs: [
      { id: 'open-roles', label: 'Открытые роли' },
      { id: 'responses', label: 'Отклики' },
      { id: 'pipeline', label: 'Этапы найма' }
    ]
  },
  {
    id: 'tasks',
    label: 'Задачи',
    slug: 'tasks',
    description: 'Планирование и отслеживание задач.',
    tabs: [
      { id: 'kanban', label: 'Канбан / Спринт' },
      { id: 'gantt', label: 'Гант / Дорожная карта' },
      { id: 'reports', label: 'Отчётность' }
    ]
  },
  {
    id: 'design',
    label: 'Дизайн',
    slug: 'design',
    description: 'Дизайн-система, макеты и печатные материалы.',
    tabs: [
      { id: 'brand', label: 'Бренд-система' },
      { id: 'layouts', label: 'Макеты' },
      { id: 'print', label: 'Печать / Полиграфия' }
    ]
  },
  {
    id: 'web',
    label: 'Сайт / Разработка',
    slug: 'web',
    description: 'Разработка и сопровождение продукта.',
    tabs: [
      { id: 'repo', label: 'Репозиторий' },
      { id: 'pages', label: 'Страницы' },
      { id: 'bugs', label: 'Баги' }
    ]
  },
  {
    id: 'marketing',
    label: 'Маркетинг',
    slug: 'marketing',
    description: 'Кампании, креативы и медиа-план.',
    tabs: [
      { id: 'personas', label: 'Персоны / JTBD' },
      { id: 'campaigns', label: 'Кампании' },
      { id: 'calendar', label: 'Календарь' }
    ]
  },
  {
    id: 'contractors',
    label: 'Подрядчики',
    slug: 'contractors',
    description: 'Каталог и заказы у подрядчиков.',
    roles: ['FOUNDER', 'PM', 'CONTRACTOR'],
    tabs: [
      { id: 'catalog', label: 'Каталог подрядчиков' },
      { id: 'orders', label: 'Текущие заказы' },
      { id: 'contracts', label: 'Договоры' }
    ]
  },
  {
    id: 'ai',
    label: 'AI проекта',
    slug: 'ai',
    description: 'AI-сессии и история взаимодействий.',
    tabs: [
      { id: 'sessions', label: 'Сессии' },
      { id: 'history', label: 'История' },
      { id: 'library', label: 'Библиотека' }
    ]
  },
  {
    id: 'finance',
    label: 'Финансы проекта',
    slug: 'finance',
    description: 'Бюджет, счета и эскроу.',
    roles: ['FOUNDER', 'PM', 'ADMIN'],
    tabs: [
      { id: 'budget', label: 'Бюджет' },
      { id: 'escrow', label: 'Эскроу' },
      { id: 'invoices', label: 'Счета' }
    ]
  },
  {
    id: 'docs',
    label: 'Документы',
    slug: 'docs',
    description: 'Хранилище документов и доступов.',
    tabs: [
      { id: 'nda', label: 'NDA / Лицензии' },
      { id: 'brandbook', label: 'Брендбук' },
      { id: 'access', label: 'Доступы' }
    ]
  },
  {
    id: 'timeline',
    label: 'Таймлайн',
    slug: 'timeline',
    description: 'Вехи и ключевые события проекта.',
    tabs: [
      { id: 'events', label: 'События' },
      { id: 'milestones', label: 'Вехи' },
      { id: 'reports', label: 'Отчёты' }
    ]
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    slug: 'analytics',
    description: 'Метрики продукта и маркетинга.',
    tabs: [
      { id: 'dashboards', label: 'Дашборды' },
      { id: 'funnels', label: 'Воронки' },
      { id: 'exports', label: 'Экспорты' }
    ]
  },
  {
    id: 'settings',
    label: 'Настройки проекта',
    slug: 'settings',
    description: 'Общие настройки и интеграции.',
    roles: ['FOUNDER', 'PM', 'ADMIN'],
    tabs: [
      { id: 'general', label: 'Основные' },
      { id: 'integrations', label: 'Интеграции' },
      { id: 'security', label: 'Безопасность' }
    ]
  }
];

export function getProjectMenuForRoles(roles: UserRole[]): ProjectMenuItem[] {
  return baseMenu.filter((item) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.some((role) => roles.includes(role));
  });
}

export { baseMenu as PROJECT_MENU_BASE };
