import AppSection from '@/components/app/AppSection';

export default function ProjectArchivePage() {
  return (
    <AppSection
      title="Архив проектов"
      description="История завершённых инициатив и сохранённых артефактов."
      actions={[
        { label: 'Восстановить проект', message: 'TODO: Восстановить проект' },
        { label: 'Экспортировать данные', message: 'TODO: Экспорт архива' }
      ]}
    />
  );
}
