import type { MarketplaceTemplate } from '@/lib/marketplace/types';

const categoryLabels: Record<string, string> = {
  logo: 'Логотипы',
  landing: 'Лендинги',
  ui_kit: 'UI-киты',
  presentation: 'Презентации'
};

export default function TemplateMetaGrid({ template }: { template: MarketplaceTemplate }) {
  return (
    <section className="grid gap-6 rounded-2xl border border-neutral-800/80 bg-neutral-950/40 p-6 sm:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Категория</p>
        <p className="text-base font-semibold text-neutral-100">{categoryLabels[template.category]}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Совместимость</p>
        <p className="text-sm text-neutral-300">{template.compatibility.join(', ')}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Рейтинг</p>
        <p className="text-base font-semibold text-neutral-100">
          {template.rating.toFixed(1)} ★
          <span className="ml-2 text-sm font-normal text-neutral-500">({template.ratingCount} оценок)</span>
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Продажи</p>
        <p className="text-base font-semibold text-neutral-100">{template.salesCount}</p>
      </div>
    </section>
  );
}
