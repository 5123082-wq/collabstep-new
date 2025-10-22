import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';

export default function MyProjectsPage() {
  return (
    <section className="rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Мои проекты</p>
        <h1 className="text-3xl font-semibold text-white">Вы ещё не владеете ни одним проектом</h1>
        <p className="mx-auto max-w-2xl text-base text-neutral-400">
          Запланируйте новый проект или присоединитесь к существующим инициативам, чтобы они появились здесь.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ProjectsDrawerTrigger entityId="OWNER-000" mode="owner-insight">
          Показать карточку владельца
        </ProjectsDrawerTrigger>
      </div>
    </section>
  );
}
