import AppSection from '@/components/app/AppSection';

export default function MarketplacePacksPage() {
  return (
    <AppSection
      title="Пакеты услуг"
      description="Готовые продуктовые наборы услуг от проверенных команд."
      actions={[
        { label: 'Запросить детали', message: 'TODO: Запросить детали пакета' },
        { label: 'Сохранить пакет', message: 'TODO: Сохранить пакет' }
      ]}
    />
  );
}
