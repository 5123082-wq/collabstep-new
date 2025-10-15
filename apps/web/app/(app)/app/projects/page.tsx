import AppSection from '@/components/app/AppSection';

export default function ProjectsPage() {
  return (
    <AppSection
      title="Проекты"
      description="Управляйте портфелем, контролируйте дедлайны и статус запусков."
      actions={[
        { label: 'Создать проект', message: 'TODO: Создать проект' },
        { label: 'Импортировать из Jira', message: 'TODO: Импорт из Jira' }
      ]}
    />
  );
}
