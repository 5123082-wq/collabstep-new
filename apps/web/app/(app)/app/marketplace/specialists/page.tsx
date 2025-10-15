import AppSection from '@/components/app/AppSection';

export default function MarketplaceSpecialistsPage() {
  return (
    <AppSection
      title="Специалисты"
      description="Просматривайте карточки экспертов и создавайте команды."
      actions={[
        { label: 'Запросить смету', message: 'TODO: Запросить смету у специалиста' },
        { label: 'Добавить в пайплайн', message: 'TODO: Добавить в пайплайн' }
      ]}
    />
  );
}
