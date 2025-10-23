'use client';

import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';

export default function ProjectCreatePlaceholderPage() {
  return (
    <section className="space-y-6 rounded-3xl border border-neutral-900/60 bg-neutral-950/60 px-10 py-12 shadow-inner">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Мастер создания</p>
        <h1 className="text-3xl font-semibold text-white">Мастер проектов появится в P3</h1>
        <p className="max-w-2xl text-base text-neutral-400">
          На этом шаге будет живой конструктор, который поможет настроить проект, определить команды и стартовать выполнение.
          Сейчас вы можете изучить карточку проекта, чтобы увидеть будущие данные.
        </p>
      </div>
      <ProjectsDrawerTrigger className="px-6 py-3" entityType="project" entityId="NEW-000" mode="create">
        Открыть пример карточки
      </ProjectsDrawerTrigger>
    </section>
  );
}
