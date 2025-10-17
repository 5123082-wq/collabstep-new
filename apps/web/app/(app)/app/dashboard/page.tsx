import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function DashboardPage() {
  const stageRange = getStageRangeFor('dashboard.widgets');
  return (
    <AppSection
      title="Рабочий стол"
      description="Сводка по проектам, задачам и метрикам команды."
      actions={[
        { label: 'Обновить виджеты', message: 'TODO: Обновить виджеты' },
        { label: 'Запланировать синк', message: 'TODO: Запланировать синк' }
      ]}
      roadmap={{
        sectionId: 'dashboard.widgets',
        status: 'DEMO',
        message: `Виджеты подключаются на этапах ${stageRange}. Сейчас — демо-макет.`,
        linkLabel: 'План релизов'
      }}
    />
  );
}
