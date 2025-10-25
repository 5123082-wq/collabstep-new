import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';
import FavoritesView from '@/components/marketplace/templates/FavoritesView';
import { templates } from '@/lib/marketplace/data';

export default function MarketFavoritesPage() {
  return (
    <div className="space-y-6">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Избранное' }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-neutral-50">Избранное</h1>
        <p className="text-neutral-400">
          Сохраняйте шаблоны и проекты, чтобы быстро возвращаться к ним и собирать подборки для команды.
        </p>
      </header>
      <FavoritesView templates={templates} />
    </div>
  );
}
