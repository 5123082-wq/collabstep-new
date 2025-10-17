import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function FinanceWalletPage() {
  const stageRange = getStageRangeFor('global.finance');
  return (
    <AppSection
      title="Кошелёк"
      description="Управление балансом и внутренними расчётами."
      access="finance"
      actions={[
        { label: 'Пополнить баланс', message: 'TODO: Пополнить баланс' },
        { label: 'Выплатить вознаграждение', message: 'TODO: Выплатить вознаграждение' }
      ]}
      roadmap={{
        sectionId: 'global.finance',
        status: 'COMING_SOON',
        message: `Раздел включится на этапе ${stageRange} (этап ${stageRange} — тестовые платежи). Сейчас — демо-заглушка.`
      }}
    />
  );
}
