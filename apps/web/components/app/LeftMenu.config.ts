export type LeftMenuIcon =
  | 'dashboard'
  | 'projects'
  | 'marketplace'
  | 'marketing'
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
  | 'performers';

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

export const PROJECTS_HUB_PATH = '/app/projects';
export const MARKETING_HUB_PATH = '/app/marketing';
export const PROJECTS_MENU_SECTION: LeftMenuSection = {
  id: 'projects',
  label: 'Проекты',
  icon: 'projects',
  href: PROJECTS_HUB_PATH,
  children: [
    { id: 'projects-overview', label: 'Обзор проектов', href: PROJECTS_HUB_PATH },
    { id: 'projects-my', label: 'Мои проекты', href: `${PROJECTS_HUB_PATH}/my` },
    { id: 'projects-templates', label: 'Шаблоны', href: `${PROJECTS_HUB_PATH}/templates` },
    { id: 'projects-archive', label: 'Архив', href: `${PROJECTS_HUB_PATH}/archive` },
    { id: 'projects-divider', type: 'divider' },
    { id: 'projects-create', label: 'Создать проект', href: `${PROJECTS_HUB_PATH}/create` },
    { id: 'projects-workspace', label: 'Рабочее пространство', href: `${PROJECTS_HUB_PATH}/workspace` }
  ]
};

const baseLeftMenuConfig: LeftMenuSection[] = [
  {
    id: 'dashboard',
    label: 'Обзор',
    icon: 'dashboard',
    href: '/app/dashboard'
  },
  PROJECTS_MENU_SECTION,
  {
    id: 'marketplace',
    label: 'Маркетплейс',
    icon: 'marketplace',
    href: '/market/templates',
    children: [
      { id: 'marketplace-templates', label: 'Каталог шаблонов', href: '/market/templates' },
      { id: 'marketplace-projects', label: 'Готовые проекты', href: '/market/projects' },
      { id: 'marketplace-services', label: 'Пакеты услуг', href: '/market/services' },
      { id: 'marketplace-categories', label: 'Категории и подборки', href: '/market/categories' },
      { id: 'marketplace-favorites', label: 'Избранное', href: '/market/favorites' },
      { id: 'marketplace-cart', label: 'Корзина', href: '/market/cart' },
      { id: 'marketplace-orders', label: 'Мои заказы', href: '/market/orders' },
      { id: 'marketplace-divider', type: 'divider' },
      { id: 'marketplace-publish', label: 'Опубликовать', href: '/market/publish' },
      { id: 'marketplace-seller', label: 'Мои продажи', href: '/market/seller' }
    ]
  },
  {
    id: 'performers',
    label: 'Исполнители',
    icon: 'performers',
    href: '/app/performers/specialists',
    children: [
      { id: 'performers-specialists', label: 'Специалисты', href: '/app/performers/specialists' },
      { id: 'performers-teams', label: 'Команды и подрядчики', href: '/app/performers/teams' },
      { id: 'performers-vacancies', label: 'Вакансии и задачи', href: '/app/performers/vacancies' },
      { id: 'performers-my-vacancies', label: 'Мои вакансии', href: '/app/performers/my-vacancies' },
      { id: 'performers-responses', label: 'Отклики и приглашения', href: '/app/performers/responses' }
    ]
  },
  {
    id: 'marketing',
    label: 'Маркетинг',
    icon: 'marketing',
    href: `${MARKETING_HUB_PATH}/overview`,
    children: [
      { id: 'marketing-overview', label: 'Обзор', href: `${MARKETING_HUB_PATH}/overview` },
      { id: 'marketing-campaigns', label: 'Кампании & Реклама', href: `${MARKETING_HUB_PATH}/campaigns` },
      { id: 'marketing-research', label: 'Исследования', href: `${MARKETING_HUB_PATH}/research` },
      { id: 'marketing-content-seo', label: 'Контент & SEO', href: `${MARKETING_HUB_PATH}/content-seo` },
      { id: 'marketing-analytics', label: 'Аналитика & Интеграции', href: `${MARKETING_HUB_PATH}/analytics` }
    ]
  },
  {
    id: 'ai-hub',
    label: 'AI-хаб',
    icon: 'ai',
    href: '/app/ai-hub/generations',
    children: [
      { id: 'ai-generations', label: 'Генерации', href: '/app/ai-hub/generations' },
      { id: 'ai-history', label: 'История', href: '/app/ai-hub/history' },
      { id: 'ai-prompts', label: 'Промпты', href: '/app/ai-hub/prompts' },
      { id: 'ai-agents', label: 'Агенты', href: '/app/ai-hub/agents' }
    ]
  },
  {
    id: 'community',
    label: 'Комьюнити',
    icon: 'community',
    href: '/app/community/pitch',
    children: [
      { id: 'community-pitch', label: 'Питч', href: '/app/community/pitch' },
      { id: 'community-rooms', label: 'Комнаты', href: '/app/community/rooms' },
      { id: 'community-events', label: 'События', href: '/app/community/events' },
      { id: 'community-rating', label: 'Рейтинг', href: '/app/community/rating' }
    ]
  },
  {
    id: 'finance',
    label: 'Финансы',
    icon: 'finance',
    roles: ['FOUNDER', 'PM', 'ADMIN'],
    href: '/app/finance/expenses',
    children: [
      { id: 'finance-expenses', label: 'Расходы', href: '/app/finance/expenses', roles: ['FOUNDER', 'PM', 'ADMIN'] },
      { id: 'finance-wallet', label: 'Кошелёк', href: '/app/finance/wallet', roles: ['FOUNDER', 'PM', 'ADMIN'] },
      { id: 'finance-escrow', label: 'Эскроу', href: '/app/finance/escrow', roles: ['FOUNDER', 'PM', 'ADMIN'] },
      { id: 'finance-invoices', label: 'Счета', href: '/app/finance/invoices', roles: ['FOUNDER', 'PM', 'ADMIN'] },
      { id: 'finance-plans', label: 'Тарифы', href: '/app/finance/plans', roles: ['FOUNDER', 'PM', 'ADMIN'] },
      { id: 'finance-disputes', label: 'Споры', href: '/app/finance/disputes', roles: ['FOUNDER', 'PM', 'ADMIN'] }
    ]
  },
  {
    id: 'docs',
    label: 'Документы',
    icon: 'docs',
    href: '/app/docs/files',
    children: [
      { id: 'docs-files', label: 'Файлы', href: '/app/docs/files' },
      { id: 'docs-contracts', label: 'Контракты', href: '/app/docs/contracts' },
      { id: 'docs-brand', label: 'Бренд-репозиторий', href: '/app/docs/brand-repo' }
    ]
  },
  {
    id: 'org',
    label: 'Организация',
    icon: 'org',
    href: '/app/org/team',
    children: [
      { id: 'org-team', label: 'Команда', href: '/app/org/team' },
      { id: 'org-billing', label: 'Биллинг', href: '/app/org/billing' },
      { id: 'org-templates', label: 'Процесс-шаблоны', href: '/app/org/process-templates' }
    ]
  },
  {
    id: 'support',
    label: 'Поддержка',
    icon: 'support',
    href: '/app/support/help',
    children: [
      { id: 'support-help', label: 'База знаний', href: '/app/support/help' },
      { id: 'support-tickets', label: 'Тикеты', href: '/app/support/tickets' },
      { id: 'support-chat', label: 'Чат', href: '/app/support/chat' }
    ]
  },
  {
    id: 'admin',
    label: 'Админка',
    icon: 'admin',
    roles: ['ADMIN', 'MODERATOR'],
    href: '/app/admin'
  }
];

export const leftMenuConfig: LeftMenuSection[] = baseLeftMenuConfig;
