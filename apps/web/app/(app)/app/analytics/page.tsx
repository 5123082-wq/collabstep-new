'use client';

import WorkspacePage, {
  type WorkspaceAction,
  type WorkspaceRenderContext,
  type WorkspaceSubnavItem
} from '@/components/workspace/WorkspacePage';

const actions: WorkspaceAction[] = [
  {
    id: 'analytics-export',
    label: 'Экспорт отчёта',
    message: 'TODO: Подготовить экспорт в CSV'
  },
  {
    id: 'analytics-widget',
    label: 'Добавить виджет',
    message: 'TODO: Открыть библиотеку дашбордов'
  }
];

const metricsRenderer = ({ data }: WorkspaceRenderContext) => {
  const metrics = data?.analytics ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-400">{metric.metric}</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-50">{metric.value}</p>
          <p className="text-xs text-neutral-500">Период: {metric.period}</p>
          <p className={metric.change >= 0 ? 'text-xs text-emerald-300' : 'text-xs text-rose-300'}>
            {metric.change >= 0 ? '+' : ''}
            {metric.change}% динамика
          </p>
        </div>
      ))}
    </div>
  );
};

const dashboardsRenderer = ({ data }: WorkspaceRenderContext) => {
  const metrics = data?.metrics ?? [];
  const analytics = data?.analytics ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">Карта метрик</h2>
          <ul className="mt-3 space-y-2">
            {metrics.map((metric) => (
              <li key={metric.id} className="flex items-center justify-between rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3 text-sm text-neutral-200">
                <span>{metric.label}</span>
                <span>{metric.value}{metric.unit}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
          <h2 className="text-sm font-semibold text-neutral-100">Индикаторы роста</h2>
          <div className="mt-3 grid gap-3">
            {analytics.map((item) => (
              <div key={item.id} className="rounded-xl border border-neutral-900/60 bg-neutral-900/40 p-3">
                <p className="text-sm font-medium text-neutral-100">{item.metric}</p>
                <p className="text-xs text-neutral-500">{item.period}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${item.change >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(Math.abs(item.change) * 5 + 20, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const reportsRenderer = ({ data }: WorkspaceRenderContext) => {
  const events = data?.events ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
      <h2 className="text-sm font-semibold text-neutral-100">Готовые отчёты</h2>
      <p className="text-xs text-neutral-400">Отслеживайте ключевые контрольные точки и релизы.</p>
      <div className="overflow-hidden rounded-xl border border-neutral-900/60">
        <table className="min-w-full divide-y divide-neutral-900/80 text-sm">
          <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Событие</th>
              <th className="px-4 py-3 text-left font-medium">Тип</th>
              <th className="px-4 py-3 text-left font-medium">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/80 text-neutral-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-indigo-500/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-100">{event.title}</div>
                  <div className="text-xs text-neutral-500">{event.owner}</div>
                </td>
                <td className="px-4 py-3 text-xs uppercase tracking-wide text-indigo-200">{event.type}</td>
                <td className="px-4 py-3 text-xs text-neutral-400">{new Date(event.date).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white"
      >
        Настроить расписание отчётов
      </button>
    </div>
  );
};

const subnav: WorkspaceSubnavItem[] = [
  { id: 'metrics', label: 'Метрики', description: 'Быстрый срез ключевых показателей', render: metricsRenderer },
  { id: 'dashboards', label: 'Дашборды', description: 'Комплексный вид по продукту и командам', render: dashboardsRenderer },
  { id: 'reports', label: 'Отчёты', description: 'Шаблоны регулярной отчётности', render: reportsRenderer }
];

export default function AnalyticsPage() {
  return (
    <WorkspacePage
      title="Аналитика"
      description="Анализируйте прогресс, конверсию и рост продукта в едином окне."
      actions={actions}
      subnav={subnav}
    />
  );
}
