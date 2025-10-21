'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'settings-access',
    label: 'Управление доступами',
    message: 'TODO: Открыть управление ролями'
  },
  {
    id: 'settings-notify',
    label: 'Настройки уведомлений',
    message: 'TODO: Настроить уведомления команды'
  }
];

const generalRenderer = ({ data }: WorkspaceRenderContext) => {
  const settings = (data?.settings ?? []).filter((setting) => setting.category === 'general');

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Общие параметры</h2>
      <ul className="space-y-2">
        {settings.map((setting) => (
          <li key={setting.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{setting.name}</span>
              <span className="text-xs text-neutral-400">{setting.value}</span>
            </div>
            <p className="text-xs text-neutral-500">{setting.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const accessRenderer = ({ data }: WorkspaceRenderContext) => {
  const settings = (data?.settings ?? []).filter((setting) => setting.category === 'access');
  const team = data?.team ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Политики доступа</h2>
        <ul className="mt-3 space-y-2">
          {settings.map((setting) => (
            <li key={setting.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <p className="text-sm font-medium text-neutral-100">{setting.name}</p>
              <p className="text-xs text-neutral-500">{setting.description}</p>
              <span className="mt-2 inline-flex rounded-full bg-indigo-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
                {setting.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
        <h2 className="text-sm font-semibold text-neutral-100">Ответственные</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => (
            <div key={member.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
              <p className="text-sm font-medium text-neutral-100">{member.name}</p>
              <p className="text-xs text-neutral-400">{member.role}</p>
              <p className="text-xs text-neutral-500">Фокус: {member.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const notificationsRenderer = ({ data }: WorkspaceRenderContext) => {
  const settings = (data?.settings ?? []).filter((setting) => setting.category === 'notifications');

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Уведомления</h2>
      <p className="text-xs text-neutral-400">Синхронизируйте оповещения между командами.</p>
      <ul className="space-y-2">
        {settings.map((setting) => (
          <li key={setting.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{setting.name}</span>
              <span className="text-xs text-neutral-400">{setting.value}</span>
            </div>
            <p className="text-xs text-neutral-500">{setting.description}</p>
            <button
              type="button"
              className="mt-2 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white"
            >
              Изменить расписание
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'general', label: 'Общие', description: 'Основные параметры рабочей области', render: generalRenderer },
  { id: 'access', label: 'Доступы', description: 'Политики доступа и роли', render: accessRenderer },
  { id: 'notifications', label: 'Уведомления', description: 'Настройки оповещений и каналов', render: notificationsRenderer }
];

export default function SettingsPage() {
  return (
    <WorkspacePage
      title="Настройки"
      description="Определяйте правила работы, доступы и коммуникации для команды."
      actions={actions}
      subnav={subnav}
    />
  );
}
