import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';

export default function ProjectsWorkspacePlaceholder() {
  return (
    <section className="space-y-6 rounded-3xl border border-neutral-900/60 bg-neutral-950/60 px-10 py-12 shadow-inner">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Рабочее пространство</p>
        <h1 className="text-3xl font-semibold text-white">Командное пространство скоро будет доступно</h1>
        <p className="max-w-3xl text-base text-neutral-400">
          Здесь появятся представления по задачам, финансам и ресурсам для выбранного рабочего пространства. Мы зарезервировали
          место для будущих модулей и интеграций.
        </p>
      </div>
      <ProjectsDrawerTrigger className="px-6 py-3" entityType="workspace" entityId="OPS-TEAM" mode="workspace">
        Открыть карточку рабочего пространства
      </ProjectsDrawerTrigger>
    </section>
  );
}
