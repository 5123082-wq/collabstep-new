import { notFound } from 'next/navigation';
import ProjectTasksPageV1 from './project-tasks-page-v1';
import ProjectTasksWorkspaceClient from './project-tasks-workspace-client';
import { flags } from '@/lib/flags';
import { memory } from '@/mocks/projects-memory';
import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const BOARD_COLUMNS = [
  { id: 'backlog', title: 'Backlog', tasks: 12 },
  { id: 'in-progress', title: 'В работе', tasks: 6 },
  { id: 'review', title: 'Ревью', tasks: 3 },
  { id: 'done', title: 'Готово', tasks: 18 }
];

const GANTT_ITEMS = [
  { id: 'design', title: 'Дизайн витрины', status: 'On track' },
  { id: 'backend', title: 'API заказов', status: 'В работе' },
  { id: 'testing', title: 'QA спринт', status: 'Запланировано' }
];

const REPORTS = [
  { id: 'velocity', title: 'Velocity', value: '24 → 26 story points', trend: '+8%' },
  { id: 'cycle', title: 'Cycle time', value: '3.5 дня', trend: '-0.5 дня' },
  { id: 'bugs', title: 'Defects', value: '4 открыто', trend: '+1' }
];

type PageProps = {
  params: { id: string };
  searchParams?: { view?: string };
};

function LegacyTasksLanding() {
  return (
    <ProjectPageFrame slug="tasks">
      <ProjectSection
        id="kanban"
        title="Канбан / Спринт"
        description="Рабочий борт задач и планирование спринтов."
        actions={[
          { id: 'create-task', label: 'Создать задачу', toastMessage: 'TODO: Создать задачу', tone: 'primary' },
          { id: 'assign-task', label: 'Назначить', toastMessage: 'TODO: Назначить задачу' },
          { id: 'checklists', label: 'Управлять чек-листами', toastMessage: 'TODO: Настроить чек-листы' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD_COLUMNS.map((column) => (
            <div key={column.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{column.title}</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-200">{column.tasks}</p>
              <p className="text-xs text-neutral-500">задач</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="gantt"
        title="Гант / Дорожная карта"
        description="Контроль зависимостей и сроков релизов."
        actions={[
          { id: 'dependencies', label: 'Управлять зависимостями', toastMessage: 'TODO: Управлять зависимостями' },
          { id: 'move-dates', label: 'Сменить сроки', toastMessage: 'TODO: Сменить сроки', tone: 'primary' }
        ]}
      >
        <div className="space-y-3">
          {GANTT_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <p className="text-xs text-neutral-500">Статус: {item.status}</p>
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-800">
                <div className="h-2 w-1/2 rounded-full bg-indigo-500" />
              </div>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="reports"
        title="Отчётность"
        description="Основные показатели по эффективности команд."
        actions={[{ id: 'generate-report', label: 'Сформировать отчёт', toastMessage: 'TODO: Сформировать отчёт' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {REPORTS.map((report) => (
            <div key={report.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{report.title}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-100">{report.value}</p>
              <p className="text-xs text-neutral-400">{report.trend}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </ProjectPageFrame>
  );
}

export default function ProjectTasksPage({ params, searchParams }: PageProps) {
  const project = memory.PROJECTS.find((candidate) => candidate.id === params.id);

  if (!project && flags.TASKS_WORKSPACE) {
    notFound();
  }

  if (flags.TASKS_WORKSPACE && project) {
    const initialView = searchParams?.view === 'list' ? 'list' : 'kanban';
    return (
      <ProjectTasksWorkspaceClient projectId={project.id} projectTitle={project.title} initialView={initialView} />
    );
  }

  if (flags.PROJECTS_V1) {
    return <ProjectTasksPageV1 params={params} searchParams={searchParams ?? {}} />;
  }

  return <LegacyTasksLanding />;
}
