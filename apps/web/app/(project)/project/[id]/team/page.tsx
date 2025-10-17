import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';
import { getStageRangeFor } from '@/lib/roadmap';

const CORE_TEAM = [
  { id: 'founder', name: 'Алина Федорова', role: 'FOUNDER', focus: 'Стратегия и партнёры' },
  { id: 'pm', name: 'Максим Карпов', role: 'PM', focus: 'Планирование спринтов' },
  { id: 'designer', name: 'Оля Степанова', role: 'Lead Designer', focus: 'Бренд и UI' }
];

const ROLE_MATRIX = [
  { id: 'design', title: 'Дизайн', responsible: 'Оля Степанова', access: 'Figma, Brand repo' },
  { id: 'development', title: 'Разработка', responsible: 'Максим Карпов', access: 'GitHub, CI/CD' },
  { id: 'marketing', title: 'Маркетинг', responsible: 'Алина Федорова', access: 'CRM, Ads manager' }
];

const ACTIVITY = [
  { id: 'standup', title: 'Статус-дэй', time: 'Ежедневно 10:00', owner: 'PM' },
  { id: 'retro', title: 'Ретро спринта', time: 'Каждые 2 недели', owner: 'Команда' },
  { id: 'sync', title: 'Синк с подрядчиками', time: 'По четвергам', owner: 'FOUNDER' }
];

const TEAM_STAGE_RANGE = getStageRangeFor('project.team');

export default function ProjectTeamPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="core-team"
        title="Ядро команды"
        description="Основные роли и точки контакта внутри проекта."
        actions={[{ id: 'invite', label: 'Пригласить участника', toastMessage: 'TODO: Пригласить участника', tone: 'primary' }]}
        roadmap={{
          sectionId: 'project.team',
          status: 'DEMO',
          message: `Функции появятся на этапах ${TEAM_STAGE_RANGE}. Сейчас — демо-режим.`
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {CORE_TEAM.map((member) => (
            <div key={member.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{member.name}</p>
              <p className="text-xs text-neutral-400">{member.role}</p>
              <p className="mt-3 text-xs text-neutral-500">{member.focus}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="roles"
        title="Роли и доступы"
        description="Матрица ответственности и выданных доступов."
        actions={[{ id: 'update-roles', label: 'Обновить роли', toastMessage: 'TODO: Обновить роли' }]}
      >
        <div className="space-y-3">
          {ROLE_MATRIX.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wide text-indigo-100">
                  {item.responsible}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Доступы: {item.access}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="activity"
        title="Активность"
        description="Регулярные ритуалы и встречи по проекту."
        actions={[{ id: 'plan-ritual', label: 'Запланировать встречу', toastMessage: 'TODO: Запланировать встречу' }]}
      >
        <div className="space-y-3">
          {ACTIVITY.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.time}</p>
              </div>
              <span className="text-xs text-neutral-500">Ведёт: {item.owner}</span>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
