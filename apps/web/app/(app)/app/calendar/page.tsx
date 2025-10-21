'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'calendar-sync',
    label: 'Синхронизировать',
    message: 'TODO: Запустить синхронизацию календарей'
  },
  {
    id: 'calendar-event',
    label: 'Создать событие',
    message: 'TODO: Открыть создание события'
  }
];

const agendaRenderer = ({ data }: WorkspaceRenderContext) => {
  const events = [...(data?.events ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-2 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Повестка ближайших дней</h2>
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="flex items-center justify-between rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div>
              <p className="text-sm font-medium text-neutral-50">{event.title}</p>
              <p className="text-xs text-neutral-400">{event.owner}</p>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>{new Date(event.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}</p>
              <p className="uppercase tracking-wide text-indigo-300">{event.type}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const timelineRenderer = ({ data }: WorkspaceRenderContext) => {
  const events = data?.events ?? [];
  const groups = events.reduce<Record<string, typeof events>>((acc, event) => {
    const dateKey = new Date(event.date).toLocaleDateString('ru-RU');
    const bucket = acc[dateKey] ?? [];
    bucket.push(event);
    acc[dateKey] = bucket;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .map(([date, items]) => (
          <section key={date} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
            <h2 className="text-sm font-semibold text-neutral-100">{date}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {items.map((event) => (
                <div key={event.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                  <p className="text-sm font-medium text-neutral-100">{event.title}</p>
                  <p className="text-xs text-neutral-400">{new Date(event.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-xs text-neutral-500">Ответственный: {event.owner}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};

const workloadRenderer = ({ data }: WorkspaceRenderContext) => {
  const team = data?.team ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Нагрузка по команде</h2>
      <p className="text-xs text-neutral-400">Сравните загруженность членов команды на горизонте двух недель.</p>
      <div className="space-y-2">
        {team.map((member) => (
          <div key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{member.name}</span>
              <span>{member.allocation}%</span>
            </div>
            <p className="text-xs text-neutral-400">{member.role}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className={`h-full rounded-full ${member.allocation > 85 ? 'bg-rose-500' : member.allocation > 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${member.allocation}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">Фокус: {member.focus}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'agenda', label: 'Повестка', description: 'Список событий по времени', render: agendaRenderer },
  { id: 'timeline', label: 'Таймлайн', description: 'Группировка релизов и встреч по датам', render: timelineRenderer },
  { id: 'workload', label: 'Нагрузка', description: 'Нагрузка команды в ближайшие недели', render: workloadRenderer }
];

export default function CalendarPage() {
  return (
    <WorkspacePage
      title="Календарь"
      description="Планируйте релизы, встречи и контрольные точки по всей рабочей области."
      actions={actions}
      subnav={subnav}
    />
  );
}
