import { redirect } from 'next/navigation';
import AppSection from '@/components/app/AppSection';
import { getDemoSessionFromCookies } from '@/lib/auth/demo-session.server';

export default function AdminPage() {
  const session = getDemoSessionFromCookies();

  if (!session) {
    redirect('/login?toast=auth-required');
  }

  if (session.role !== 'admin') {
    redirect('/app/dashboard?toast=forbidden');
  }

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
