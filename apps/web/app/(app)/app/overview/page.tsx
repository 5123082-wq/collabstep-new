'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const numberFormatter = new Intl.NumberFormat('ru-RU');

const actions: WorkspaceAction[] = [
  {
    id: 'overview-refresh',
    label: 'Обновить данные',
    message: 'Обновляем сводку',
    onClick: async ({ refresh }) => {
      await refresh();
    }
  },
  {
    id: 'overview-widget',
    label: 'Добавить виджет',
    message: 'TODO: Настроить добавление пользовательского виджета'
  }
];

const summaryRenderer = ({ data }: WorkspaceRenderContext) => {
  const metrics = data?.metrics ?? [];
  const roadmaps = data?.roadmaps ?? [];
  const events = data?.events ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-neutral-50">
              {numberFormatter.format(metric.value)}{metric.unit}
            </p>
            {typeof metric.trend === 'number' ? (
              <p className="mt-1 text-xs text-emerald-300">
                {metric.trend > 0 ? '+' : ''}
                {metric.trend}% за период
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">Ключевые дорожные карты</h2>
          <ul className="space-y-2">
            {roadmaps.map((roadmap) => (
              <li key={roadmap.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <div className="flex items-center justify-between text-sm text-neutral-200">
                  <span>{roadmap.name}</span>
                  <span>{roadmap.stage}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span>{roadmap.owner}</span>
                  <span>{roadmap.progress}%</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${roadmap.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">Ближайшие события</h2>
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <div>
                  <p className="text-sm font-medium text-neutral-50">{event.title}</p>
                  <p className="text-xs text-neutral-400">{event.owner}</p>
                </div>
                <div className="text-right text-xs text-neutral-400">
                  <p>{new Date(event.date).toLocaleDateString('ru-RU')}</p>
                  <p className="uppercase tracking-wide text-indigo-300">{event.type}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const pulseRenderer = ({ data }: WorkspaceRenderContext) => {
  const team = data?.team ?? [];
  const tasks = data?.tasks ?? [];

  const totalLoad = team.reduce((acc, member) => acc + member.allocation, 0);
  const averageLoad = team.length ? Math.round(totalLoad / team.length) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Пульс команды</h2>
        <p className="text-xs text-neutral-400">Средняя загрузка команды {averageLoad}%</p>
        <ul className="space-y-2">
          {team.map((member) => (
            <li key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between text-sm text-neutral-200">
                <span>{member.name}</span>
                <span>{member.allocation}%</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
                <span>{member.role}</span>
                <span>{member.status === 'busy' ? 'Занят' : member.status === 'available' ? 'Свободен' : 'В отпуске'}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">Фокус: {member.focus}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Радар задач</h2>
        <p className="text-xs text-neutral-400">Контролируйте ключевые задачи спринта</p>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between text-sm text-neutral-100">
                <span>{task.title}</span>
                <span className="text-xs uppercase tracking-wide text-indigo-300">{task.status}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
                <span>{task.owner}</span>
                <span>до {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
              </div>
              <span className="mt-2 inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
                Приоритет: {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const insightsRenderer = ({ data }: WorkspaceRenderContext) => {
  const analytics = data?.analytics ?? [];
  const modules = data?.modules ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {analytics.map((item) => (
          <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{item.metric}</p>
            <p className="mt-3 text-2xl font-semibold text-neutral-50">{item.value}</p>
            <p className="mt-1 text-xs text-neutral-500">Период: {item.period}</p>
            <p className={item.change >= 0 ? 'text-xs text-emerald-300' : 'text-xs text-rose-300'}>
              {item.change >= 0 ? '+' : ''}
              {item.change}% динамика
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Состояние ключевых модулей</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {modules.map((module) => (
            <div key={module.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <p className="text-sm font-medium text-neutral-100">{module.name}</p>
              <p className="text-xs text-neutral-400">{module.focus}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span>{module.owner}</span>
                <span>{module.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className={`h-full rounded-full ${module.health === 'at-risk' ? 'bg-amber-400' : module.health === 'blocked' ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${module.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'summary', label: 'Сводка', description: 'Ключевые метрики и события по проектам', render: summaryRenderer },
  { id: 'pulse', label: 'Пульс', description: 'Загрузка команды и приоритетные задачи', render: pulseRenderer },
  { id: 'insights', label: 'Инсайты', description: 'Аналитика и состояние модулей', render: insightsRenderer }
];

export default function OverviewPage() {
  return (
    <WorkspacePage
      title="Обзор рабочей области"
      description="Единое место для отслеживания прогресса команды и продуктов."
      actions={actions}
      subnav={subnav}
    />
  );
}
