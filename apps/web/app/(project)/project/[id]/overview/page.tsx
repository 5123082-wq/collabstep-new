import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const STAGE_ITEMS = [
  { id: 'idea', title: 'Идея', status: 'Завершено', progress: 100 },
  { id: 'brief', title: 'Бриф', status: 'Активно', progress: 60 },
  { id: 'team', title: 'Набор команды', status: 'Запланировано', progress: 20 },
  { id: 'design', title: 'Дизайн', status: 'Ожидает запуска', progress: 0 }
];

const KPI_ITEMS = [
  { id: 'scope', label: 'Дедлайн', value: '30 окт', trend: 'В срок' },
  { id: 'budget', label: 'Бюджет', value: '3.5 млн ₽', trend: '75% освоено' },
  { id: 'velocity', label: 'Velocity', value: '24 точки', trend: '+4 за спринт' }
];

const RISK_ITEMS = [
  { id: 'suppliers', title: 'Подрядчик мерча', level: 'Высокий', status: 'Требует планирования' },
  { id: 'analytics', title: 'Источники данных', level: 'Средний', status: 'Нужно согласование доступа' },
  { id: 'scope', title: 'Расширение функциональности', level: 'Низкий', status: 'Под контролем' }
];

export default function ProjectOverviewPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="stages"
        title="Карта стадий"
        description="Прогресс по жизненному циклу проекта и ближайшие переходы."
        actions={[{ id: 'go-stage', label: 'Перейти к стадии', toastMessage: 'TODO: Перейти к стадии', tone: 'primary' }]}
      >
        <div className="grid gap-3 md:grid-cols-4">
          {STAGE_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.status}</p>
              <div className="mt-4 h-2 w-full rounded-full bg-neutral-800">
                <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="kpi"
        title="KPI / Сроки / Бюджет"
        description="Ключевые показатели, контроль сроков и освоения бюджета."
        actions={[
          { id: 'plan', label: 'Изменить план', toastMessage: 'TODO: Изменить план', tone: 'primary' },
          { id: 'export', label: 'Экспортировать', toastMessage: 'TODO: Экспортировать план' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {KPI_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-100">{item.value}</p>
              <p className="text-xs text-neutral-400">{item.trend}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="risks"
        title="Риски"
        description="Зона внимания команды и митигирующие действия."
        actions={[{ id: 'risk-create', label: 'Создать риск', toastMessage: 'TODO: Создать риск', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {RISK_ITEMS.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.status}</p>
              </div>
              <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                {item.level}
              </span>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
