import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';
import { FeatureComingSoon } from '@/components/app/FeatureComingSoon';
import { flags } from '@/lib/flags';

export default function ProjectTemplatesPage() {
  if (!flags.PROJECTS_OVERVIEW) {
    return (
      <FeatureComingSoon
        // [PLAN:S2-220] Зафлагировано до завершения Stage 2.
        title="Шаблоны проектов"
        description="Раздел доступен в рамках нового обзора проектов. Включите фич-флаг NEXT_PUBLIC_FEATURE_PROJECTS_OVERVIEW, чтобы протестировать функциональность."
      />
    );
  }

  return (
    <section className="rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Шаблоны</p>
        <h1 className="text-3xl font-semibold text-white">Шаблонов нет</h1>
        <p className="text-base text-neutral-400">
          Опубликуйте первый шаблон из существующего проекта, чтобы команда могла быстро стартовать новые направления.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ProjectsDrawerTrigger entityType="template" entityId="TPL-001" mode="preview">
          Показать карточку шаблона
        </ProjectsDrawerTrigger>
      </div>
    </section>
  );
}
