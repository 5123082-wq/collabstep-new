import Link from 'next/link';
import ProjectsDrawerTrigger from '@/components/projects/ProjectsDrawerTrigger';

export default function ProjectsOverviewPage() {
  return (
    <section className="flex min-h-[420px] flex-col justify-center gap-10 rounded-3xl border border-dashed border-neutral-900/60 bg-neutral-950/60 px-10 py-16 text-center shadow-inner">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Обзор</p>
        <h1 className="text-3xl font-semibold text-white">У вас пока нет проектов</h1>
        <p className="mx-auto max-w-2xl text-base text-neutral-400">
          Нажмите «Создать проект» или выберите шаблон, чтобы запустить первую инициативу.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/app/projects/create"
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Создать проект
        </Link>
        <Link
          href="/app/projects/templates"
          className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-100 transition hover:border-indigo-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Выбрать шаблон
        </Link>
        <ProjectsDrawerTrigger className="px-6 py-3" entityId="DEMO-001" mode="preview">
          Показать карточку проекта
        </ProjectsDrawerTrigger>
      </div>
    </section>
  );
}
