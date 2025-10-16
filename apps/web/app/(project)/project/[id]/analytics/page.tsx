import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const DASHBOARDS = [
  { id: 'sales', title: 'Продажи', value: '1.2 млн ₽', trend: '+12%' },
  { id: 'traffic', title: 'Трафик', value: '85 тыс.', trend: '+6%' },
  { id: 'retention', title: 'Retention', value: '48%', trend: '+3%' }
];

const FUNNELS = [
  { id: 'awareness', title: 'Awareness → Consideration', conversion: '36%' },
  { id: 'consideration', title: 'Consideration → Purchase', conversion: '18%' }
];

export default function ProjectAnalyticsPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="dashboards"
        title="Дашборды"
        description="Основные показатели продукта."
        actions={[
          { id: 'download-csv', label: 'Скачать CSV', toastMessage: 'TODO: Скачать CSV', tone: 'primary' },
          { id: 'share-dashboard', label: 'Поделиться', toastMessage: 'TODO: Поделиться дашбордом' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {DASHBOARDS.map((metric) => (
            <div key={metric.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{metric.title}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-100">{metric.value}</p>
              <p className="text-xs text-neutral-400">{metric.trend}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="funnels"
        title="Воронки"
        description="Пути пользователя и конверсии."
        actions={[{ id: 'share-funnel', label: 'Поделиться', toastMessage: 'TODO: Поделиться воронкой', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {FUNNELS.map((funnel) => (
            <div key={funnel.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{funnel.title}</p>
              <p className="text-xs text-neutral-400">Конверсия: {funnel.conversion}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
