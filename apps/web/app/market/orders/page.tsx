import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';

export default function MarketOrdersPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Мои заказы' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Мои заказы</h1>
        <p className="max-w-3xl text-neutral-400">
          Здесь появится история покупок, статусы и защищённые ссылки на файлы. После интеграции оплаты раздел
          будет обновлён.
        </p>
      </header>
      <div className="rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-10 text-sm text-neutral-400">
        У вас пока нет заказов.
      </div>
    </div>
  );
}
