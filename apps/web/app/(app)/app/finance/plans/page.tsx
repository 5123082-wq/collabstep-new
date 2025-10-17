import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function FinancePlansPage() {
  const stageRange = getStageRangeFor('global.finance');
  return (
    <AppSection
      title="Тарифы и планы"
      description="Выбирайте и настраивайте тарифы для команды и клиентов."
      access="finance"
      actions={[
        { label: 'Обновить тариф', message: 'TODO: Обновить тариф' },
        { label: 'Согласовать контракт', message: 'TODO: Согласовать контракт' }
      ]}
      roadmap={{
        sectionId: 'global.finance',
        status: 'COMING_SOON',
        message: `Раздел включится на этапе ${stageRange} (этап ${stageRange} — тестовые платежи). Сейчас — демо-заглушка.`
      }}
    />
  );
}
