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
  | 'admin';

export type LeftMenuChild = {
  id: string;
  label: string;
  href: string;
  description?: string;
  roles?: ('FOUNDER' | 'SPECIALIST' | 'CONTRACTOR' | 'PM' | 'ADMIN' | 'MODERATOR' | 'OBSERVER')[];
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
    id: 'dashboard',
    label: 'Обзор',
    icon: 'dashboard',
    href: '/app/dashboard'
  },
  {
    id: 'projects',
    label: 'Проекты',
    icon: 'projects',
    href: '/app/projects',
    children: [
      { id: 'projects-all', label: 'Мои проекты', href: '/app/projects' },
      { id: 'projects-templates', label: 'Шаблоны', href: '/app/projects/templates' },
      { id: 'projects-archive', label: 'Архив', href: '/app/projects/archive' }
    ]
  },
  {
    id: 'marketplace',
    label: 'Маркетплейс',
    icon: 'marketplace',
    href: '/app/marketplace/projects',
    children: [
      { id: 'marketplace-projects', label: 'Проекты', href: '/app/marketplace/projects' },
      { id: 'marketplace-vacancies', label: 'Вакансии', href: '/app/marketplace/vacancies' },
      { id: 'marketplace-specialists', label: 'Специалисты', href: '/app/marketplace/specialists' },
      { id: 'marketplace-contractors', label: 'Подрядчики', href: '/app/marketplace/contractors' },
      { id: 'marketplace-packs', label: 'Паки услуг', href: '/app/marketplace/packs' }
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
    href: '/app/finance/wallet',
    children: [
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
    id: 'messages',
    label: 'Сообщения',
    icon: 'messages',
    href: '/app/messages'
  },
  {
    id: 'notifications',
    label: 'Уведомления',
    icon: 'notifications',
    href: '/app/notifications'
  },
  {
    id: 'profile',
    label: 'Профиль',
    icon: 'profile',
    href: '/app/profile',
    children: [
      { id: 'profile-main', label: 'Мой профиль', href: '/app/profile' },
      { id: 'profile-rating', label: 'Рейтинг', href: '/app/profile/rating' },
      { id: 'profile-badges', label: 'Бейджи', href: '/app/profile/badges' },
      { id: 'profile-card', label: 'Профиль-лендинг', href: '/app/profile/card' }
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
