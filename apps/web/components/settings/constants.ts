import type { GlobalSectionId } from '@/lib/section-detector';

export type GlobalSection = {
  id: GlobalSectionId;
  label: string;
  icon: string;
  pathPrefix: string;
};

export const GLOBAL_SECTIONS: GlobalSection[] = [
  { id: 'dashboard', label: 'Обзор', icon: 'dashboard', pathPrefix: '/app/dashboard' },
  { id: 'projects', label: 'Проекты', icon: 'projects', pathPrefix: '/app/projects' },
  { id: 'marketplace', label: 'Маркетплейс', icon: 'marketplace', pathPrefix: '/market' },
  { id: 'performers', label: 'Исполнители', icon: 'performers', pathPrefix: '/app/performers' },
  { id: 'marketing', label: 'Маркетинг', icon: 'marketing', pathPrefix: '/app/marketing' },
  { id: 'ai-hub', label: 'AI-хаб', icon: 'ai', pathPrefix: '/app/ai-hub' },
  { id: 'community', label: 'Комьюнити', icon: 'community', pathPrefix: '/app/community' },
  { id: 'finance', label: 'Финансы', icon: 'finance', pathPrefix: '/app/finance' },
  { id: 'docs', label: 'Документы', icon: 'docs', pathPrefix: '/app/docs' },
  { id: 'org', label: 'Организация', icon: 'org', pathPrefix: '/app/org' },
  { id: 'support', label: 'Поддержка', icon: 'support', pathPrefix: '/app/support' },
  { id: 'admin', label: 'Админка', icon: 'admin', pathPrefix: '/app/admin' }
];

export const SECTION_THEME_VARIANTS = [
  {
    id: 'default' as const,
    label: 'По умолчанию',
    description: 'Стандартное оформление с нейтральными цветами',
    previewClassName: 'rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6'
  },
  {
    id: 'accent' as const,
    label: 'Акцентный',
    description: 'Выделение с акцентным цветом',
    previewClassName: 'rounded-3xl border border-indigo-500/40 bg-indigo-500/10 p-6'
  },
  {
    id: 'minimal' as const,
    label: 'Минималистичный',
    description: 'Упрощенное оформление с меньшими отступами',
    previewClassName: 'rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4'
  },
  {
    id: 'bordered' as const,
    label: 'С рамкой',
    description: 'Четкие границы и контрастный фон',
    previewClassName: 'rounded-2xl border-2 border-neutral-800 bg-neutral-950/80 p-6'
  }
];

export const ACCENT_COLORS = [
  { id: 'indigo' as const, label: 'Индиго', className: 'border-indigo-500/40 bg-indigo-500/10' },
  { id: 'emerald' as const, label: 'Изумрудный', className: 'border-emerald-500/40 bg-emerald-500/10' },
  { id: 'amber' as const, label: 'Янтарный', className: 'border-amber-500/40 bg-amber-500/10' },
  { id: 'rose' as const, label: 'Розовый', className: 'border-rose-500/40 bg-rose-500/10' },
  { id: 'blue' as const, label: 'Синий', className: 'border-blue-500/40 bg-blue-500/10' },
  { id: 'purple' as const, label: 'Фиолетовый', className: 'border-purple-500/40 bg-purple-500/10' }
];

