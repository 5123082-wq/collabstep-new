import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function AiPromptsPage() {
  const stageRange = getStageRangeFor('global.aiHub');
  return (
    <AppSection
      title="Библиотека промптов"
      description="Сохраняйте лучшие промпты и делитесь ими внутри команды."
      actions={[
        { label: 'Создать промпт', message: 'TODO: Создать промпт' },
        { label: 'Опубликовать в каталоге', message: 'TODO: Опубликовать промпт' }
      ]}
      roadmap={{
        sectionId: 'global.aiHub',
        status: 'COMING_SOON',
        message: `Генерации (mock) — этап ${stageRange}. Сейчас — демо-сцена.`
      }}
    />
  );
}
