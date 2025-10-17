import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function MarketplaceSpecialistsPage() {
  const stageRange = getStageRangeFor('global.marketplace');
  return (
    <AppSection
      title="Специалисты"
      description="Просматривайте карточки экспертов и создавайте команды."
      actions={[
        { label: 'Запросить смету', message: 'TODO: Запросить смету у специалиста' },
        { label: 'Добавить в пайплайн', message: 'TODO: Добавить в пайплайн' }
      ]}
      roadmap={{
        sectionId: 'global.marketplace',
        status: 'DEMO',
        message: `Маркетплейс подключается на этапе ${stageRange}. Сейчас — демо-витрина.`
      }}
    />
  );
}
