import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function FinanceInvoicesPage() {
  const stageRange = getStageRangeFor('global.finance');
  return (
    <AppSection
      title="Счета"
      description="Формируйте и отправляйте счета подрядчикам и клиентам."
      access="finance"
      actions={[
        { label: 'Создать счёт', message: 'TODO: Создать счёт' },
        { label: 'Отправить напоминание', message: 'TODO: Напомнить об оплате' }
      ]}
      roadmap={{
        sectionId: 'global.finance',
        status: 'COMING_SOON',
        message: `Раздел включится на этапе ${stageRange} (этап ${stageRange} — тестовые платежи). Сейчас — демо-заглушка.`
      }}
    />
  );
}
