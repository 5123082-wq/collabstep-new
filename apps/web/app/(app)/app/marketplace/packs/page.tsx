import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function MarketplacePacksPage() {
  const stageRange = getStageRangeFor('global.marketplace');
  return (
    <AppSection
      title="Пакеты услуг"
      description="Готовые продуктовые наборы услуг от проверенных команд."
      actions={[
        { label: 'Запросить детали', message: 'TODO: Запросить детали пакета' },
        { label: 'Сохранить пакет', message: 'TODO: Сохранить пакет' }
      ]}
      roadmap={{
        sectionId: 'global.marketplace',
        status: 'DEMO',
        message: `Маркетплейс подключается на этапе ${stageRange}. Сейчас — демо-витрина.`
      }}
    />
  );
}
