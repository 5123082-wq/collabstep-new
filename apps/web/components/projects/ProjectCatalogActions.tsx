'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectCatalog } from '@/hooks/projects/useProjectCatalog';
import { useProjectDrawer } from '@/hooks/projects/useProjectDrawer';

export default function ProjectCatalogActions() {
  const { createProject, refresh, loading } = useProjectCatalog();
  const { openCreateProject } = useProjectDrawer();
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = useCallback(async () => {
    if (isCreating) {
      return;
    }
    setIsCreating(true);
    try {
      const timestamp = new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date());
      await createProject({
        title: `Проект ${timestamp}`,
        description: 'Черновой проект, созданный из каталога',
        stage: null
      });
    } finally {
      setIsCreating(false);
    }
  }, [createProject, isCreating]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={handleQuickCreate} loading={isCreating} size="sm">
        Быстрый проект
      </Button>
      <Button variant="secondary" onClick={openCreateProject} size="sm">
        Настроить карточку
      </Button>
      <Button variant="ghost" onClick={refresh} loading={loading} size="sm">
        Обновить список
      </Button>
    </div>
  );
}
