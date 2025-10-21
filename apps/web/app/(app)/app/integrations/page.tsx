'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'integrations-add',
    label: 'Подключить интеграцию',
    message: 'TODO: Открыть маркет интеграций'
  },
  {
    id: 'integrations-audit',
    label: 'Журнал доступа',
    message: 'TODO: Просмотреть аудит действий'
  }
];

const connectedRenderer = ({ data }: WorkspaceRenderContext) => {
  const integrations = (data?.integrations ?? []).filter((integration) => integration.status !== 'not-configured');

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Подключённые сервисы</h2>
      <p className="text-xs text-neutral-400">Контролируйте состояние ключевых каналов данных.</p>
      <ul className="space-y-2">
        {integrations.map((integration) => (
          <li key={integration.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{integration.name}</span>
              <span className={integration.status === 'connected' ? 'text-emerald-300' : 'text-rose-300'}>
                {integration.status === 'connected' ? 'Активно' : 'Ошибка'}
              </span>
            </div>
            <p className="text-xs text-neutral-500">{integration.description}</p>
            <p className="text-xs text-neutral-500">Обновлено: {new Date(integration.updatedAt).toLocaleString('ru-RU')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const marketRenderer = ({ data }: WorkspaceRenderContext) => {
  const integrations = data?.integrations ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {integrations.map((integration) => (
        <div key={integration.id} className="space-y-2 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">{integration.name}</h2>
          <p className="text-xs text-neutral-400">{integration.description}</p>
          <button
            type="button"
            className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20"
          >
            Настроить подключение
          </button>
        </div>
      ))}
    </div>
  );
};

const activityRenderer = ({ data }: WorkspaceRenderContext) => {
  const integrations = data?.integrations ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Журнал активности</h2>
      <p className="text-xs text-neutral-400">Последние изменения и синхронизации.</p>
      <div className="overflow-hidden rounded-xl border border-neutral-900/60">
        <table className="min-w-full divide-y divide-neutral-900/80 text-sm">
          <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Интеграция</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
              <th className="px-4 py-3 text-left font-medium">Обновлено</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/80 text-neutral-200">
            {integrations.map((integration) => (
              <tr key={integration.id} className="hover:bg-indigo-500/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-100">{integration.name}</div>
                  <div className="text-xs text-neutral-500">{integration.description}</div>
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-wide text-indigo-200">{integration.status}</td>
                <td className="px-4 py-3 text-xs text-neutral-400">{new Date(integration.updatedAt).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'connected', label: 'Подключено', description: 'Состояние активных интеграций', render: connectedRenderer },
  { id: 'market', label: 'Каталог', description: 'Доступные коннекторы и сервисы', render: marketRenderer },
  { id: 'activity', label: 'Активность', description: 'Хронология обновлений', render: activityRenderer }
];

export default function IntegrationsPage() {
  return (
    <WorkspacePage
      title="Интеграции"
      description="Подключайте внешние сервисы и контролируйте стабильность синхронизаций."
      actions={actions}
      subnav={subnav}
    />
  );
}
