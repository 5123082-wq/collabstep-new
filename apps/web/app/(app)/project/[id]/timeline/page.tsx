import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const EVENTS = [
  { id: 'kickoff', title: 'Kick-off', date: '1 октября', owner: 'Команда' },
  { id: 'design-review', title: 'Дизайн-ревью', date: '10 октября', owner: 'Дизайн' },
  { id: 'beta', title: 'Бета-доступ', date: '25 октября', owner: 'Продукт' }
];

const MILESTONES = [
  { id: 'brief', title: 'Утверждён бриф', status: 'Сделано' },
  { id: 'collection', title: 'Формирование коллекции', status: 'В работе' }
];

export default function ProjectTimelinePage() {
  return (
    <ProjectPageFrame slug="timeline">
      <ProjectSection
        id="events"
        title="События"
        description="Календарь ключевых событий проекта."
        actions={[
          { id: 'filter', label: 'Фильтр', toastMessage: 'TODO: Фильтр событий', tone: 'primary' },
          { id: 'export-report', label: 'Экспорт отчёта', toastMessage: 'TODO: Экспортировать отчёт' }
        ]}
      >
        <div className="space-y-3">
          {EVENTS.map((event) => (
            <div key={event.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{event.title}</p>
                <p className="text-xs text-neutral-400">Ответственный: {event.owner}</p>
              </div>
              <span className="text-xs text-neutral-500">{event.date}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="milestones"
        title="Вехи"
        description="Ключевые этапы и статусы."
        actions={[{ id: 'create-milestone', label: 'Создать веху', toastMessage: 'TODO: Создать веху', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {MILESTONES.map((milestone) => (
            <div key={milestone.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{milestone.title}</p>
                <span className="text-xs text-neutral-500">{milestone.status}</span>
              </div>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </ProjectPageFrame>
  );
}
