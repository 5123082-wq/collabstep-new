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
    id: 'calendar',
    label: 'Календарь',
    slug: 'calendar',
    description: 'Дорожная карта и календари команд.',
    tabs: [
      { id: 'timeline', label: 'Дорожная карта' },
      { id: 'team-calendar', label: 'Календари команд' },
      { id: 'sync', label: 'Синхронизации' }
    ]
  },
  {
    id: 'team',
    label: 'Команда',
    slug: 'team',
    description: 'Состав команды, роли и зоны ответственности.',
    tabs: [
      { id: 'core-team', label: 'Ядро команды' },
      { id: 'roles', label: 'Роли и доступы' },
      { id: 'activity', label: 'Активность' }
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
    id: 'automations',
    label: 'Автоматизации',
    slug: 'automations',
    description: 'Правила, боты и библиотека сценариев.',
    tabs: [
      { id: 'rules', label: 'Правила' },
      { id: 'bots', label: 'Боты' },
      { id: 'recipes', label: 'Рецепты' }
    ]
  },
  {
    id: 'modules',
    label: 'Модули',
    slug: 'modules',
    description: 'Конструктор рабочей среды проекта.',
    tabs: [
      { id: 'catalog', label: 'Каталог' },
      { id: 'library', label: 'Пакеты' },
      { id: 'requests', label: 'Запросы' }
    ]
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    slug: 'integrations',
    description: 'Подключения, маркетплейс и API.',
    tabs: [
      { id: 'connected', label: 'Подключённые' },
      { id: 'marketplace', label: 'Маркетплейс' },
      { id: 'api', label: 'API и ключи' }
    ]
  },
  {
    id: 'settings',
    label: 'Настройки',
    slug: 'settings',
    description: 'Общие настройки и политики доступа.',
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
