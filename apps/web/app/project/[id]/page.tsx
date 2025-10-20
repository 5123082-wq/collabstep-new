import Link from 'next/link';
import { notFound } from 'next/navigation';
import { flags } from '@/lib/flags';
import { PROJECTS } from '@/app/api/projects/storage';

const quickLinks = [
  { href: (id: string) => `/project/${id}/tasks`, label: 'Задачи' },
  { href: (id: string) => `/project/${id}/files`, label: 'Файлы' },
  { href: (id: string) => `/project/${id}/chat`, label: 'Чат' },
  { href: (id: string) => `/project/${id}/settings`, label: 'Настройки' }
] as const;

const WIDGETS = [
  {
    id: 'progress',
    title: 'Прогресс проекта',
    description: 'Обновления появятся, когда команда начнёт работу.'
  },
  {
    id: 'team',
    title: 'Команда и роли',
    description: 'Здесь отобразится состав команды и ответственные.'
  },
  {
    id: 'next-steps',
    title: 'Следующие шаги',
    description: 'Добавьте задачи, чтобы увидеть ближайшие активности.'
  }
] as const;

type ProjectPageParams = {
  params: {
    id: string;
  };
};

export default function ProjectDashboardPage({ params }: ProjectPageParams) {
  if (!flags.PROJECTS_V1) {
    notFound();
  }

  const project = PROJECTS.find((item) => item.id === params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8 px-6 py-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Дашборд проекта</p>
        <h1 className="text-4xl font-semibold text-white">{project.title}</h1>
        <p className="text-sm text-neutral-400">
          Стадия: {project.stage ?? 'discovery'} · Владелец: {project.ownerId}
        </p>
        <nav aria-label="Быстрые ссылки" className="flex flex-wrap gap-3 pt-4">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href(project.id)}
              className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200 transition hover:border-indigo-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {WIDGETS.map((widget) => (
          <article key={widget.id} className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
            <h2 className="text-lg font-semibold text-white">{widget.title}</h2>
            <p className="text-sm text-neutral-400">{widget.description}</p>
            <div className="rounded-xl border border-dashed border-neutral-800/70 bg-neutral-950/60 p-4 text-xs text-neutral-500">
              Виджет появится в следующих итерациях CRM.
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
