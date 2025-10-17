import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function FinanceDisputesPage() {
  const stageRange = getStageRangeFor('global.finance');
  return (
    <AppSection
      title="Споры и эскалации"
      description="Управляйте спорными ситуациями и взаимодействием с арбитражем."
      access="finance"
      actions={[
        { label: 'Открыть спор', message: 'TODO: Открыть спор' },
        { label: 'Назначить арбитра', message: 'TODO: Назначить арбитра' }
      ]}
      roadmap={{
        sectionId: 'global.finance',
        status: 'COMING_SOON',
        message: `Раздел включится на этапе ${stageRange} (этап ${stageRange} — тестовые платежи). Сейчас — демо-заглушка.`
      }}
    />
  );
}
