'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const statusLabels: Record<string, string> = {
  backlog: 'Бэклог',
  'in-progress': 'В работе',
  review: 'На ревью',
  done: 'Готово'
};

const actions: WorkspaceAction[] = [
  {
    id: 'tasks-new',
    label: 'Создать задачу',
    message: 'TODO: Открыть форму создания задачи'
  },
  {
    id: 'tasks-roadmap',
    label: 'Построить дорожку',
    message: 'TODO: Настроить мастера дорожек'
  }
];

const boardRenderer = ({ data }: WorkspaceRenderContext) => {
  const tasks = data?.tasks ?? [];
  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const bucket = acc[task.status] ?? [];
    bucket.push(task);
    acc[task.status] = bucket;
    return acc;
  }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Object.entries(grouped).map(([status, items]) => (
        <div key={status} className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-100">{statusLabels[status] ?? status}</h2>
            <span className="rounded-full bg-neutral-900/60 px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-400">
              {items.length}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((task) => (
              <article key={task.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <header className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-neutral-100">{task.title}</h3>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] uppercase tracking-widest text-indigo-200">
                    {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '🌱'}
                  </span>
                </header>
                <footer className="flex items-center justify-between text-xs text-neutral-400">
                  <span>{task.owner}</span>
                  <span>до {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const listRenderer = ({ data }: WorkspaceRenderContext) => {
  const tasks = data?.tasks ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/70">
      <table className="min-w-full divide-y divide-neutral-900/80 text-sm">
        <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Задача</th>
            <th className="px-4 py-3 text-left font-medium">Исполнитель</th>
            <th className="px-4 py-3 text-left font-medium">Статус</th>
            <th className="px-4 py-3 text-left font-medium">Дедлайн</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900/80 text-neutral-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-indigo-500/5">
              <td className="px-4 py-3">
                <div className="font-medium text-neutral-100">{task.title}</div>
                <div className="text-xs text-neutral-500">Приоритет: {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}</div>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">{task.owner}</td>
              <td className="px-4 py-3 text-xs uppercase tracking-wide text-indigo-200">{statusLabels[task.status] ?? task.status}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{new Date(task.dueDate).toLocaleDateString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const roadmapRenderer = ({ data }: WorkspaceRenderContext) => {
  const roadmaps = data?.roadmaps ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Дорожки запуска</h2>
      <p className="text-xs text-neutral-400">Отслеживайте прогресс сквозных инициатив по модулям.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <div key={roadmap.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{roadmap.name}</span>
              <span>{roadmap.progress}%</span>
            </div>
            <p className="text-xs text-neutral-400">Ответственный: {roadmap.owner}</p>
            <p className="text-xs text-neutral-500">Этап: {roadmap.stage}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${roadmap.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'board', label: 'Доска', description: 'Канбан-представление активных задач', render: boardRenderer },
  { id: 'list', label: 'Список', description: 'Табличный вид задач и дедлайнов', render: listRenderer },
  { id: 'roadmap', label: 'Дорожки', description: 'Дорожные карты по продуктовым потокам', render: roadmapRenderer }
];

export default function TasksPage() {
  return (
    <WorkspacePage
      title="Задачи и дорожки"
      description="Планируйте спринты, синхронизируйте команды и управляйте фокусами."
      actions={actions}
      subnav={subnav}
    />
  );
}
