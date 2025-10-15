import AppSection from '@/components/app/AppSection';

export default function MarketplaceVacanciesPage() {
  return (
    <AppSection
      title="Вакансии"
      description="Выбирайте задачи и долгосрочные роли в активных командах."
      actions={[
        { label: 'Откликнуться', message: 'TODO: Отклик на вакансию' },
        { label: 'Поделиться вакансией', message: 'TODO: Поделиться вакансией' }
      ]}
    />
  );
}
