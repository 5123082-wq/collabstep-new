import { notFound } from 'next/navigation';
import AppSection from '@/components/app/AppSection';

type Action = { label: string; message: string };

type TabConfig = {
  title: string;
  description: string;
  actions: Action[];
};

const TAB_KEYS = ['templates', 'services', 'categories', 'favorites', 'cart', 'orders'] as const;

type MarketplaceTab = (typeof TAB_KEYS)[number];

const TAB_CONFIG: Record<MarketplaceTab, TabConfig> = {
  templates: {
    title: 'Шаблоны',
    description: 'Цифровые товары и готовые проекты для быстрого старта.',
    actions: [
      { label: 'Добавить в корзину', message: 'TODO: Добавить шаблон в корзину' },
      { label: 'Сохранить в избранное', message: 'TODO: Сохранить шаблон' }
    ]
  },
  services: {
    title: 'Пакеты услуг',
    description: 'Форматные предложения команд и студий с фиксированной стоимостью.',
    actions: [
      { label: 'Запросить обсуждение', message: 'TODO: Запросить обсуждение услуги' },
      { label: 'Сохранить пакет', message: 'TODO: Сохранить пакет услуг' }
    ]
  },
  categories: {
    title: 'Категории',
    description: 'Навигация по категориям и тематикам маркетплейса.',
    actions: [
      { label: 'Открыть популярные', message: 'TODO: Открыть популярные категории' },
      { label: 'Подобрать по нише', message: 'TODO: Подобрать категорию' }
    ]
  },
  favorites: {
    title: 'Избранное',
    description: 'Сохранённые шаблоны и пакеты услуг для быстрого доступа.',
    actions: [
      { label: 'Поделиться подборкой', message: 'TODO: Поделиться избранным' },
      { label: 'Очистить список', message: 'TODO: Очистить избранное' }
    ]
  },
  cart: {
    title: 'Корзина',
    description: 'Товары, готовые к оплате и оформлению заказа.',
    actions: [
      { label: 'Оформить заказ', message: 'TODO: Оформить заказ' },
      { label: 'Скачать счёт', message: 'TODO: Скачать счёт' }
    ]
  },
  orders: {
    title: 'Мои заказы',
    description: 'История покупок и активных заказов в маркетплейсе.',
    actions: [
      { label: 'Посмотреть детали', message: 'TODO: Открыть детали заказа' },
      { label: 'Скачать файлы', message: 'TODO: Скачать приобретённые материалы' }
    ]
  }
};

type MarketplaceTabPageProps = {
  params: { tab: string };
};

export default function MarketplaceTabPage({ params }: MarketplaceTabPageProps) {
  const key = params.tab as MarketplaceTab;

  if (!TAB_KEYS.includes(key)) {
    notFound();
  }

  const config = TAB_CONFIG[key];

  return <AppSection title={config.title} description={config.description} actions={config.actions} />;
}

export function generateStaticParams() {
  return TAB_KEYS.map((tab) => ({ tab }));
}
