import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function FinanceEscrowPage() {
  const stageRange = getStageRangeFor('global.finance');
  return (
    <AppSection
      title="Эскроу"
      description="Безопасные расчёты и контроль этапов выполнения."
      access="finance"
      actions={[
        { label: 'Открыть эскроу', message: 'TODO: Открыть эскроу' },
        { label: 'Запросить отчёт', message: 'TODO: Запросить отчёт' }
      ]}
      roadmap={{
        sectionId: 'global.finance',
        status: 'COMING_SOON',
        message: `Раздел включится на этапе ${stageRange} (этап ${stageRange} — тестовые платежи). Сейчас — демо-заглушка.`
      }}
    />
  );
}
