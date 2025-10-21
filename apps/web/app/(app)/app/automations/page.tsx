'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'automations-new',
    label: 'Создать автоматизацию',
    message: 'TODO: Запустить конструктор автоматизаций'
  },
  {
    id: 'automations-review',
    label: 'Очередь запусков',
    message: 'TODO: Открыть очередь сценариев'
  }
];

const flowsRenderer = ({ data }: WorkspaceRenderContext) => {
  const automations = data?.automations ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {automations.map((automation) => (
        <div key={automation.id} className="space-y-2 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">{automation.name}</h2>
          <p className="text-xs text-neutral-400">Триггер: {automation.trigger}</p>
          <p className="text-xs text-neutral-500">Ответственный: {automation.owner}</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
              automation.status === 'active'
                ? 'bg-emerald-500/15 text-emerald-200'
                : automation.status === 'paused'
                ? 'bg-amber-500/15 text-amber-200'
                : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            {automation.status === 'active' ? 'Активно' : automation.status === 'paused' ? 'Пауза' : 'Черновик'}
          </span>
        </div>
      ))}
    </div>
  );
};

const triggersRenderer = ({ data }: WorkspaceRenderContext) => {
  const automations = data?.automations ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Триггеры автоматизации</h2>
      <p className="text-xs text-neutral-400">Проверьте, какие события запускают сценарии.</p>
      <ul className="space-y-2">
        {automations.map((automation) => (
          <li key={automation.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-200">
              <span>{automation.trigger}</span>
              <span className="text-xs text-neutral-400">{automation.owner}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Сценарий: {automation.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const logsRenderer = ({ data }: WorkspaceRenderContext) => {
  const automations = data?.automations ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Журнал запусков</h2>
      <p className="text-xs text-neutral-400">История недавних выполнений сценариев.</p>
      <div className="overflow-hidden rounded-xl border border-neutral-900/60">
        <table className="min-w-full divide-y divide-neutral-900/80 text-sm">
          <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Сценарий</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
              <th className="px-4 py-3 text-left font-medium">Время</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/80 text-neutral-200">
            {automations.map((automation, index) => (
              <tr key={automation.id} className="hover:bg-indigo-500/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-100">{automation.name}</div>
                  <div className="text-xs text-neutral-500">Триггер: {automation.trigger}</div>
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-wide text-indigo-200">
                  {automation.status === 'active' ? 'Выполнено' : automation.status === 'paused' ? 'Остановлено' : 'Черновик'}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-400">{new Date(Date.now() - index * 3600_000).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'flows', label: 'Автопроцессы', description: 'Активные сценарии и их статус', render: flowsRenderer },
  { id: 'triggers', label: 'Триггеры', description: 'Что запускает автоматизации', render: triggersRenderer },
  { id: 'logs', label: 'Логи', description: 'История последних запусков', render: logsRenderer }
];

export default function AutomationsPage() {
  return (
    <WorkspacePage
      title="Автоматизации"
      description="Оркестрируйте процессы и синхронизируйте данные между системами."
      actions={actions}
      subnav={subnav}
    />
  );
}
