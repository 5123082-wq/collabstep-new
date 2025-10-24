import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { memory } from '@/mocks/projects-memory';

type ProjectIndexPageProps = {
  searchParams?: { tab?: string };
};

export default function ProjectIndexPage({ searchParams: _searchParams }: ProjectIndexPageProps) {
  if (isFeatureEnabled('projectsOverview')) {
    redirect('/app/projects');
  }

  return <LegacyProjectIndexPage />;
}

function LegacyProjectIndexPage() {
  const items = memory.PROJECTS ?? [];
  return (
    <div className="px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Проекты</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-white">Список проектов</h1>
          <Link
            href="/project/new"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            + Новый проект
          </Link>
        </div>
        <nav className="mt-4 flex gap-4 text-sm">
          <Link href="/project?tab=my" className="hover:underline">
            Мои проекты
          </Link>
          <Link href="/project?tab=templates" className="hover:underline">
            Шаблоны
          </Link>
          <Link href="/project?tab=archive" className="hover:underline">
            Архив
          </Link>
        </nav>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-neutral-400">
          Пока нет проектов. Нажмите «Новый проект».
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5">
              <h3 className="text-white font-semibold">{p.title}</h3>
              <p className="text-sm text-neutral-400 line-clamp-2">{p.description ?? '—'}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/project/${p.id}/tasks`} className="rounded-xl border border-neutral-700 px-3 py-1 text-sm">
                  Задачи
                </Link>
                <Link href={`/project/${p.id}/settings`} className="rounded-xl border border-neutral-700 px-3 py-1 text-sm">
                  Настройки
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
