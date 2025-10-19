import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';
import CartView from '@/components/marketplace/templates/CartView';
import { templates } from '@/lib/marketplace/data';

export default function MarketCartPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Корзина' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Корзина</h1>
        <p className="max-w-3xl text-neutral-400">
          Проверьте выбранные шаблоны перед оплатой. Услуги добавляются отдельно через запрос предложения.
        </p>
      </header>
      <CartView templates={templates} />
    </div>
  );
}
