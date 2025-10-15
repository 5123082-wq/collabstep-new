import AppSection from '@/components/app/AppSection';

export default function MarketplaceProjectsPage() {
  return (
    <AppSection
      title="Проекты сообщества"
      description="Каталог открытых проектов и предложений для специалистов."
      actions={[
        { label: 'Откликнуться', message: 'TODO: Откликнуться на проект' },
        { label: 'Добавить в избранное', message: 'TODO: Добавить в избранное' }
      ]}
    />
  );
}
