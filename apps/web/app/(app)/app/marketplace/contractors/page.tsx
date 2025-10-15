import AppSection from '@/components/app/AppSection';

export default function MarketplaceContractorsPage() {
  return (
    <AppSection
      title="Подрядчики"
      description="Проверьте агентства и подрядчиков для комплексных задач."
      actions={[
        { label: 'Запросить предложение', message: 'TODO: Запросить предложение' },
        { label: 'Сравнить подрядчиков', message: 'TODO: Сравнить подрядчиков' }
      ]}
    />
  );
}
