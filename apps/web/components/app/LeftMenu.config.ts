export type LeftMenuIcon =
  | 'dashboard'
  | 'projects'
  | 'marketplace'
  | 'ai'
  | 'community'
  | 'finance'
  | 'docs'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'org'
  | 'support'
  | 'admin'
  | 'performers'
  | 'overview'
  | 'tasks'
  | 'calendar'
  | 'team'
  | 'files'
  | 'analytics'
  | 'automations'
  | 'modules'
  | 'integrations'
  | 'settings';

type LeftMenuBaseRoles = (
  | 'FOUNDER'
  | 'SPECIALIST'
  | 'CONTRACTOR'
  | 'PM'
  | 'ADMIN'
  | 'MODERATOR'
  | 'OBSERVER'
)[];

export type LeftMenuChild =
  | {
      id: string;
      label: string;
      href: string;
      description?: string;
      roles?: LeftMenuBaseRoles;
      type?: 'link';
    }
  | {
      id: string;
      type: 'divider';
      roles?: LeftMenuBaseRoles;
    };

export type LeftMenuSection = {
  id: string;
  label: string;
  icon: LeftMenuIcon;
  href?: string;
  roles?: LeftMenuChild['roles'];
  children?: LeftMenuChild[];
};

export const leftMenuConfig: LeftMenuSection[] = [
  {
    id: 'overview',
    label: 'Обзор',
    icon: 'overview',
    href: '/app/overview',
    children: [
      { id: 'overview-summary', label: 'Сводка', href: '/app/overview' },
      { id: 'overview-pulse', label: 'Пульс команды', href: '/app/overview?section=pulse' },
      { id: 'overview-insights', label: 'Инсайты', href: '/app/overview?section=insights' }
    ]
  },
  {
    id: 'tasks',
    label: 'Задачи и дорожки',
    icon: 'tasks',
    href: '/app/tasks',
    children: [
      { id: 'tasks-board', label: 'Доска', href: '/app/tasks' },
      { id: 'tasks-list', label: 'Список', href: '/app/tasks?view=list' },
      { id: 'tasks-roadmap', label: 'Дорожки', href: '/app/tasks?view=roadmap' }
    ]
  },
  {
    id: 'calendar',
    label: 'Календарь',
    icon: 'calendar',
    href: '/app/calendar',
    children: [
      { id: 'calendar-agenda', label: 'Повестка дня', href: '/app/calendar' },
      { id: 'calendar-timeline', label: 'Таймлайн', href: '/app/calendar?view=timeline' },
      { id: 'calendar-workload', label: 'Нагрузка', href: '/app/calendar?view=workload' }
    ]
  },
  {
    id: 'team',
    label: 'Команда',
    icon: 'team',
    href: '/app/team',
    children: [
      { id: 'team-structure', label: 'Структура', href: '/app/team' },
      { id: 'team-allocation', label: 'Нагрузка', href: '/app/team?view=allocation' },
      { id: 'team-invitations', label: 'Приглашения', href: '/app/team?view=invitations' }
    ]
  },
  {
    id: 'files',
    label: 'Документы и файлы',
    icon: 'files',
    href: '/app/files',
    children: [
      { id: 'files-library', label: 'Хранилище', href: '/app/files' },
      { id: 'files-recent', label: 'Последние', href: '/app/files?view=recent' },
      { id: 'files-templates', label: 'Шаблоны', href: '/app/files?view=templates' }
    ]
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: 'analytics',
    href: '/app/analytics',
    children: [
      { id: 'analytics-overview', label: 'Метрики', href: '/app/analytics' },
      { id: 'analytics-dashboards', label: 'Дашборды', href: '/app/analytics?view=dashboards' },
      { id: 'analytics-reports', label: 'Отчёты', href: '/app/analytics?view=reports' }
    ]
  },
  {
    id: 'automations',
    label: 'Автоматизации',
    icon: 'automations',
    href: '/app/automations',
    children: [
      { id: 'automations-flows', label: 'Автопроцессы', href: '/app/automations' },
      { id: 'automations-triggers', label: 'Триггеры', href: '/app/automations?view=triggers' },
      { id: 'automations-logs', label: 'Логи', href: '/app/automations?view=logs' }
    ]
  },
  {
    id: 'modules',
    label: 'Модули',
    icon: 'modules',
    href: '/app/modules',
    children: [
      { id: 'modules-active', label: 'Активные', href: '/app/modules' },
      { id: 'modules-risk', label: 'Зоны риска', href: '/app/modules?view=risk' },
      { id: 'modules-roadmap', label: 'Обновления', href: '/app/modules?view=updates' }
    ]
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    icon: 'integrations',
    href: '/app/integrations',
    children: [
      { id: 'integrations-connected', label: 'Подключено', href: '/app/integrations' },
      { id: 'integrations-market', label: 'Каталог', href: '/app/integrations?view=market' },
      { id: 'integrations-activity', label: 'Активность', href: '/app/integrations?view=activity' }
    ]
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: 'settings',
    href: '/app/settings',
    children: [
      { id: 'settings-general', label: 'Общие', href: '/app/settings' },
      { id: 'settings-access', label: 'Доступы', href: '/app/settings?view=access' },
      { id: 'settings-notifications', label: 'Уведомления', href: '/app/settings?view=notifications' }
    ]
  }
];
