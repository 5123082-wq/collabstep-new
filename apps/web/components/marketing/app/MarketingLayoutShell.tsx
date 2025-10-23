import type { ReactNode } from 'react';
import { MARKETING_HUB_PATH } from '@/components/app/LeftMenu.config';

export const marketingNavigation = [
  {
    id: 'overview',
    label: 'Обзор',
    href: `${MARKETING_HUB_PATH}/overview`,
    description: 'Дашборд прогресса и метрик маркетинга'
  },
  {
    id: 'campaigns',
    label: 'Кампании & Реклама',
    href: `${MARKETING_HUB_PATH}/campaigns`,
    description: 'Управление кампаниями и подключёнными рекламными аккаунтами'
  },
  {
    id: 'research',
    label: 'Исследования',
    href: `${MARKETING_HUB_PATH}/research`,
    description: 'Инсайты по ЦА, соцсетям и конкурентам'
  },
  {
    id: 'content-seo',
    label: 'Контент & SEO',
    href: `${MARKETING_HUB_PATH}/content-seo`,
    description: 'Календарь публикаций и управление семантикой'
  },
  {
    id: 'analytics',
    label: 'Аналитика & Интеграции',
    href: `${MARKETING_HUB_PATH}/analytics`,
    description: 'Источники данных и атрибуция эффективности'
  }
] as const;

export default function MarketingLayoutShell({ children }: { children: ReactNode }) {
  return <div className="space-y-8">{children}</div>;
}
