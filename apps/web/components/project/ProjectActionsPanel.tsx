'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useProjectCatalog } from '@/hooks/projects/useProjectCatalog';
import { useProjectDrawer } from '@/hooks/projects/useProjectDrawer';
import { useProjectEditor } from '@/hooks/projects/useProjectEditor';

export default function ProjectActionsPanel() {
  const { project, loading } = useProjectEditor();
  const { openProject } = useProjectDrawer();
  const { refresh } = useProjectCatalog();

  const handleOpen = useCallback(() => {
    if (!project) {
      return;
    }
    openProject(project.id, 'view');
  }, [openProject, project]);

  const handleEdit = useCallback(() => {
    if (!project) {
      return;
    }
    openProject(project.id, 'edit');
  }, [openProject, project]);

  return (
    <section
      aria-label="Панель действий проекта"
      className="rounded-3xl border border-neutral-900/70 bg-neutral-950/60 p-4 shadow-sm shadow-neutral-950/10"
    >
      <header className="mb-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">Действия</h2>
        <p className="text-sm text-neutral-400">Быстрые операции с текущим проектом</p>
      </header>

      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-neutral-900/40" />
          ))}
        </div>
      ) : null}

      {!loading && !project ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/80 p-6 text-sm text-neutral-400">
          Выберите проект из каталога, чтобы открыть действия.
        </div>
      ) : null}

      {!loading && project ? (
        <div className="flex flex-col gap-3">
          <Button onClick={handleOpen} size="sm">
            Открыть карточку проекта
          </Button>
          <Button onClick={handleEdit} size="sm" variant="secondary">
            Редактировать параметры
          </Button>
          <Button onClick={refresh} size="sm" variant="ghost">
            Обновить данные
          </Button>
        </div>
      ) : null}
    </section>
  );
}
