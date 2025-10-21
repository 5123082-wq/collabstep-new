'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'modules-add',
    label: 'Подключить модуль',
    message: 'TODO: Открыть каталог модулей'
  },
  {
    id: 'modules-dependencies',
    label: 'Зависимости',
    message: 'TODO: Настроить зависимости модулей'
  }
];

const activeRenderer = ({ data }: WorkspaceRenderContext) => {
  const modules = data?.modules ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {modules.map((module) => (
        <div key={module.id} className="space-y-2 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">{module.name}</h2>
          <p className="text-xs text-neutral-400">Фокус: {module.focus}</p>
          <p className="text-xs text-neutral-500">Ответственный: {module.owner}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${module.progress}%` }} />
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
              module.health === 'on-track'
                ? 'bg-emerald-500/15 text-emerald-200'
                : module.health === 'at-risk'
                ? 'bg-amber-500/15 text-amber-200'
                : 'bg-rose-500/15 text-rose-200'
            }`}
          >
            {module.health === 'on-track' ? 'В норме' : module.health === 'at-risk' ? 'Риск' : 'Блокер'}
          </span>
        </div>
      ))}
    </div>
  );
};

const riskRenderer = ({ data }: WorkspaceRenderContext) => {
  const modules = (data?.modules ?? []).filter((module) => module.health !== 'on-track');

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Зоны риска</h2>
      <p className="text-xs text-neutral-400">План действий для критичных модулей.</p>
      <ul className="space-y-2">
        {modules.map((module) => (
          <li key={module.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between text-sm text-neutral-100">
              <span>{module.name}</span>
              <span>{module.progress}%</span>
            </div>
            <p className="text-xs text-neutral-500">Ответственный: {module.owner}</p>
            <button
              type="button"
              className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:border-rose-400 hover:bg-rose-500/20"
            >
              Открыть план стабилизации
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const updatesRenderer = ({ data }: WorkspaceRenderContext) => {
  const roadmaps = data?.roadmaps ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Обновления по дорожным картам</h2>
      <p className="text-xs text-neutral-400">Следите за прогрессом релизов и интеграций.</p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map((roadmap) => (
          <div key={roadmap.id} className="space-y-2 rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
            <p className="text-sm font-medium text-neutral-100">{roadmap.name}</p>
            <p className="text-xs text-neutral-400">Этап: {roadmap.stage}</p>
            <p className="text-xs text-neutral-500">Лидер: {roadmap.owner}</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${roadmap.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'active', label: 'Активные', description: 'Текущее состояние модулей', render: activeRenderer },
  { id: 'risk', label: 'Зоны риска', description: 'Контроль проблемных участков', render: riskRenderer },
  { id: 'updates', label: 'Обновления', description: 'Прогресс по дорожным картам', render: updatesRenderer }
];

export default function ModulesPage() {
  return (
    <WorkspacePage
      title="Модули"
      description="Агрегируйте ключевые функции, управляйте стабильностью и релизами."
      actions={actions}
      subnav={subnav}
    />
  );
}
