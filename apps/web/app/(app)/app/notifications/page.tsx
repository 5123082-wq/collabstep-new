import AppSection from '@/components/app/AppSection';

export default function NotificationsPage() {
  return (
    <AppSection
      title="Уведомления"
      description="Контролируйте важные события, дедлайны и алерты."
      actions={[
        { label: 'Очистить уведомления', message: 'TODO: Очистить уведомления' },
        { label: 'Настроить фильтры', message: 'TODO: Настроить фильтры' }
      ]}
    />
  );
}
