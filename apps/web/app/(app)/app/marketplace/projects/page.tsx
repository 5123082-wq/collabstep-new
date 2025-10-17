import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function MarketplaceProjectsPage() {
  const stageRange = getStageRangeFor('global.marketplace');
  return (
    <AppSection
      title="Проекты сообщества"
      description="Каталог открытых проектов и предложений для специалистов."
      actions={[
        { label: 'Откликнуться', message: 'TODO: Откликнуться на проект' },
        { label: 'Добавить в избранное', message: 'TODO: Добавить в избранное' }
      ]}
      roadmap={{
        sectionId: 'global.marketplace',
        status: 'DEMO',
        message: `Маркетплейс подключается на этапе ${stageRange}. Сейчас — демо-витрина.`
      }}
    />
  );
}
