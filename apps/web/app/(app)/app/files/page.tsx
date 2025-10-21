'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'files-upload',
    label: 'Загрузить файл',
    message: 'TODO: Открыть загрузчик файлов'
  },
  {
    id: 'files-folder',
    label: 'Создать папку',
    message: 'TODO: Создать новую структуру хранения'
  }
];

const libraryRenderer = ({ data }: WorkspaceRenderContext) => {
  const files = data?.files ?? [];
  const groups = files.reduce<Record<string, typeof files>>((acc, file) => {
    const bucket = acc[file.type] ?? [];
    bucket.push(file);
    acc[file.type] = bucket;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([type, items]) => (
        <section key={type} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">{type}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((file) => (
              <article key={file.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <h3 className="text-sm font-medium text-neutral-50">{file.name}</h3>
                <p className="text-xs text-neutral-400">{file.size}</p>
                <p className="text-xs text-neutral-500">Автор: {file.owner}</p>
                <p className="text-xs text-neutral-500">Обновлено: {new Date(file.updatedAt).toLocaleString('ru-RU')}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const recentRenderer = ({ data }: WorkspaceRenderContext) => {
  const files = [...(data?.files ?? [])].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/70">
      <table className="min-w-full divide-y divide-neutral-900/80 text-sm">
        <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Файл</th>
            <th className="px-4 py-3 text-left font-medium">Тип</th>
            <th className="px-4 py-3 text-left font-medium">Размер</th>
            <th className="px-4 py-3 text-left font-medium">Обновлено</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900/80 text-neutral-200">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-indigo-500/5">
              <td className="px-4 py-3">
                <div className="font-medium text-neutral-100">{file.name}</div>
                <div className="text-xs text-neutral-500">{file.owner}</div>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">{file.type}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{file.size}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{new Date(file.updatedAt).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const templatesRenderer = ({ data }: WorkspaceRenderContext) => {
  const modules = data?.modules ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Рекомендованные шаблоны</h2>
      <p className="text-xs text-neutral-400">Используйте готовые пакеты документов для ключевых модулей.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <p className="text-sm font-medium text-neutral-100">{module.name}</p>
            <p className="text-xs text-neutral-400">Фокус: {module.focus}</p>
            <p className="text-xs text-neutral-500">Ответственный: {module.owner}</p>
            <button
              type="button"
              className="w-full rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20"
            >
              Открыть набор файлов
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'library', label: 'Хранилище', description: 'Структура файлов по типам', render: libraryRenderer },
  { id: 'recent', label: 'Последние', description: 'Недавно обновлённые документы', render: recentRenderer },
  { id: 'templates', label: 'Шаблоны', description: 'Наборы документов по модулям', render: templatesRenderer }
];

export default function FilesPage() {
  return (
    <WorkspacePage
      title="Документы и файлы"
      description="Храните рабочие артефакты, шаблоны и настройки интеграций."
      actions={actions}
      subnav={subnav}
    />
  );
}
