import AppSection from '@/components/app/AppSection';

export default function AdminPage() {
  return (
    <AppSection
      title="Админ-панель"
      description="Настройки платформы, роли и глобальные политики безопасности."
      access="admin"
      actions={[
        { label: 'Управлять ролями', message: 'TODO: Управлять ролями' },
        { label: 'Сбросить кэш', message: 'TODO: Сбросить кэш' }
      ]}
    />
  );
}
