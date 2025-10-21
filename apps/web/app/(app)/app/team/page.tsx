'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'team-invite',
    label: 'Пригласить участника',
    message: 'TODO: Открыть модал приглашения'
  },
  {
    id: 'team-roles',
    label: 'Настроить роли',
    message: 'TODO: Перейти к настройке ролей'
  }
];

const structureRenderer = ({ data }: WorkspaceRenderContext) => {
  const team = data?.team ?? [];
  const groups = team.reduce<Record<string, typeof team>>((acc, member) => {
    const bucket = acc[member.role] ?? [];
    bucket.push(member);
    acc[member.role] = bucket;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([role, members]) => (
        <section key={role} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">{role}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <p className="text-sm font-medium text-neutral-100">{member.name}</p>
                <p className="text-xs text-neutral-400">Фокус: {member.focus}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                  <span>Загрузка</span>
                  <span>{member.allocation}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${member.status === 'busy' ? 'bg-indigo-500' : member.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${member.allocation}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const allocationRenderer = ({ data }: WorkspaceRenderContext) => {
  const team = data?.team ?? [];
  const total = team.reduce((acc, member) => acc + member.allocation, 0);
  const average = team.length ? Math.round(total / team.length) : 0;

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Нагрузка команд</h2>
      <p className="text-xs text-neutral-400">Средняя загрузка {average}% — скорректируйте распределение задач.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {team.map((member) => (
          <div key={member.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{member.name}</span>
              <span>{member.allocation}%</span>
            </div>
            <p className="text-xs text-neutral-500">{member.focus}</p>
            <div className="h-24 overflow-hidden rounded-xl border border-neutral-900/60 bg-neutral-900/50">
              <div className="h-full w-full bg-gradient-to-b from-indigo-500/30 via-indigo-500/10 to-transparent">
                <div className="flex h-full items-end">
                  <div className="w-full bg-indigo-500/70" style={{ height: `${Math.min(member.allocation, 100)}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400">
              Статус: {member.status === 'busy' ? 'загружен' : member.status === 'available' ? 'доступен' : 'в отпуске'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const invitationsRenderer = ({ data }: WorkspaceRenderContext) => {
  const team = data?.team ?? [];
  const available = team.filter((member) => member.status === 'available');
  const candidates = team.filter((member) => member.status === 'vacation');

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Свободные ресурсы</h2>
        <p className="text-xs text-neutral-400">Эти специалисты доступны для подключения к задачам.</p>
        <ul className="space-y-2">
          {available.map((member) => (
            <li key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between text-sm text-neutral-100">
                <span>{member.name}</span>
                <span>{member.allocation}%</span>
              </div>
              <p className="text-xs text-neutral-400">{member.focus}</p>
              <button
                type="button"
                className="mt-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20"
              >
                Отправить приглашение
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Кандидаты в онбординге</h2>
        <p className="text-xs text-neutral-400">Синхронизируйте выход специалистов заранее.</p>
        <ul className="space-y-2">
          {candidates.map((member) => (
            <li key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <p className="text-sm font-medium text-neutral-100">{member.name}</p>
              <p className="text-xs text-neutral-500">Запланирован возврат: {new Date().toLocaleDateString('ru-RU')}</p>
              <button
                type="button"
                className="mt-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white"
              >
                Настроить план онбординга
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'structure', label: 'Структура', description: 'Командные роли и фокусы', render: structureRenderer },
  { id: 'allocation', label: 'Нагрузка', description: 'Загрузка и распределение задач', render: allocationRenderer },
  { id: 'invitations', label: 'Приглашения', description: 'Управление ресурсами и онбордингом', render: invitationsRenderer }
];

export default function TeamPage() {
  return (
    <WorkspacePage
      title="Команда"
      description="Управляйте структурой команды, загрузкой и онбордингом исполнителей."
      actions={actions}
      subnav={subnav}
    />
  );
}
