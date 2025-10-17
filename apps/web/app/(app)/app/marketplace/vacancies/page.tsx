import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function MarketplaceVacanciesPage() {
  const stageRange = getStageRangeFor('global.marketplace');
  return (
    <AppSection
      title="Вакансии"
      description="Выбирайте задачи и долгосрочные роли в активных командах."
      actions={[
        { label: 'Откликнуться', message: 'TODO: Отклик на вакансию' },
        { label: 'Поделиться вакансией', message: 'TODO: Поделиться вакансией' }
      ]}
      roadmap={{
        sectionId: 'global.marketplace',
        status: 'DEMO',
        message: `Маркетплейс подключается на этапе ${stageRange}. Сейчас — демо-витрина.`
      }}
    />
  );
}
