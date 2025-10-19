import type { Metadata } from 'next';
import MarketBreadcrumbs from '@/components/marketplace/MarketBreadcrumbs';
import TemplatesCatalog from '@/components/marketplace/templates/TemplatesCatalog';
import { templates } from '@/lib/marketplace/data';

export const metadata: Metadata = {
  title: 'Каталог шаблонов — Collabverse Market',
  description: '12 подборок шаблонов и UI-китов для быстрого старта проекта.'
};

export default function MarketTemplatesPage() {
  return (
    <div className="space-y-8">
      <MarketBreadcrumbs items={[{ label: 'Маркетплейс', href: '/market' }, { label: 'Каталог шаблонов' }]} />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Каталог шаблонов</h1>
        <p className="text-neutral-400 sm:text-lg">
          Подборка готовых UI-комплектов, презентаций и лендингов. Добавляйте в корзину, сохраняйте в
          избранное и собирайте коллекции для своих проектов.
        </p>
      </div>
      <TemplatesCatalog templates={templates} />
    </div>
  );
}
