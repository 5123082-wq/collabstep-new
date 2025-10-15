import AppSection from '@/components/app/AppSection';

export default function AiAgentsPage() {
  return (
    <AppSection
      title="AI-агенты"
      description="Настраивайте агентов, роли и наборы инструментов для автоматизации."
      actions={[
        { label: 'Создать агента', message: 'TODO: Создать агента' },
        { label: 'Назначить проект', message: 'TODO: Назначить проект агенту' }
      ]}
    />
  );
}
