import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function AiGenerationsPage() {
  const stageRange = getStageRangeFor('global.aiHub');
  return (
    <AppSection
      title="AI-генерации"
      description="Следите за статусом генераций и делитесь результатами с командой."
      actions={[
        { label: 'Запустить генерацию', message: 'TODO: Запустить генерацию' },
        { label: 'Настроить модель', message: 'TODO: Настроить модель' }
      ]}
      roadmap={{
        sectionId: 'global.aiHub',
        status: 'COMING_SOON',
        message: `Генерации (mock) — этап ${stageRange}. Сейчас — демо-сцена.`
      }}
    />
  );
}
