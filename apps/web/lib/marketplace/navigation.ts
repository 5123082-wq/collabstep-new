export type MarketNavItem = {
  title: string;
  href: string;
  badge?: string;
};

export type MarketNavSection =
  | { type: 'group'; title: string; items: MarketNavItem[] }
  | { type: 'separator' };

export const MARKET_NAVIGATION: MarketNavSection[] = [
  {
    type: 'group',
    title: 'Маркетплейс',
    items: [
      { title: 'Каталог шаблонов', href: '/market/templates' },
      { title: 'Готовые проекты', href: '/market/projects' },
      { title: 'Пакеты услуг', href: '/market/services', badge: 'new' },
      { title: 'Категории и подборки', href: '/market/categories' },
      { title: 'Избранное', href: '/market/favorites' },
      { title: 'Корзина', href: '/market/cart' },
      { title: 'Мои заказы', href: '/market/orders' }
    ]
  },
  { type: 'separator' },
  {
    type: 'group',
    title: 'Публикация',
    items: [
      { title: 'Опубликовать', href: '/market/publish' },
      { title: 'Мои продажи', href: '/market/seller' }
    ]
  }
];
