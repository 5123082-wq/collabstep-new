import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function MarketplaceContractorsPage() {
  const stageRange = getStageRangeFor('global.contractors');
  return (
    <AppSection
      title="Подрядчики"
      description="Проверьте агентства и подрядчиков для комплексных задач."
      actions={[
        { label: 'Запросить предложение', message: 'TODO: Запросить предложение' },
        { label: 'Сравнить подрядчиков', message: 'TODO: Сравнить подрядчиков' }
      ]}
      roadmap={{
        sectionId: 'global.contractors',
        status: 'COMING_SOON',
        message: `Сметы и заказы — этап ${stageRange}. Сейчас — демо-каталог.`
      }}
    />
  );
}
