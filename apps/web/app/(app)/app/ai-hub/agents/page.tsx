import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function AiAgentsPage() {
  const stageRange = getStageRangeFor('global.aiHub');
  return (
    <AppSection
      title="AI-агенты"
      description="Настраивайте агентов, роли и наборы инструментов для автоматизации."
      actions={[
        { label: 'Создать агента', message: 'TODO: Создать агента' },
        { label: 'Назначить проект', message: 'TODO: Назначить проект агенту' }
      ]}
      roadmap={{
        sectionId: 'global.aiHub',
        status: 'COMING_SOON',
        message: `Генерации (mock) — этап ${stageRange}. Сейчас — демо-сцена.`
      }}
    />
  );
}
