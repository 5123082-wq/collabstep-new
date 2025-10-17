import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function AiHistoryPage() {
  const stageRange = getStageRangeFor('global.aiHub');
  return (
    <AppSection
      title="История AI"
      description="Просматривайте историю запросов и повторно запускайте сессии."
      actions={[
        { label: 'Повторить сессию', message: 'TODO: Повторить сессию' },
        { label: 'Экспорт в Notion', message: 'TODO: Экспорт в Notion' }
      ]}
      roadmap={{
        sectionId: 'global.aiHub',
        status: 'COMING_SOON',
        message: `Генерации (mock) — этап ${stageRange}. Сейчас — демо-сцена.`
      }}
    />
  );
}
