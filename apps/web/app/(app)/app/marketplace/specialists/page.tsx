import SpecialistsCatalog from '@/components/marketplace/SpecialistsCatalog';
import { loadSpecialists } from '@/lib/mock/loaders';

export default function MarketplaceSpecialistsPage() {
  const { items, error } = loadSpecialists();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-50">Специалисты</h1>
        <p className="text-sm text-neutral-400">Каталог экспертов и подрядчиков с возможностью фильтрации.</p>
      </header>
      <SpecialistsCatalog data={items} error={error} />
    </div>
  );
}
