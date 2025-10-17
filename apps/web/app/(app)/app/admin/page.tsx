import AppSection from '@/components/app/AppSection';
import { getStageRangeFor } from '@/lib/roadmap';

export default function AdminPage() {
  const stageRange = getStageRangeFor('global.admin');
  return (
    <AppSection
      title="Админ-панель"
      description="Настройки платформы, роли и глобальные политики безопасности."
      access="admin"
      actions={[
        { label: 'Управлять ролями', message: 'TODO: Управлять ролями' },
        { label: 'Сбросить кэш', message: 'TODO: Сбросить кэш' }
      ]}
      roadmap={{
        sectionId: 'global.admin',
        status: 'COMING_SOON',
        message: `Модерация — этап ${stageRange}. Сейчас — демо-панель.`
      }}
    />
  );
}
