import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';
import { getStageRangeFor } from '@/lib/roadmap';

const OPEN_ROLES = [
  { id: 'frontend', title: 'Frontend-разработчик', level: 'Senior', status: 'Открыта' },
  { id: 'smm', title: 'SMM-менеджер', level: 'Middle', status: 'В работе' },
  { id: 'producer', title: 'Продюсер мероприятий', level: 'Contract', status: 'Новая' }
];

const RESPONSES = [
  { id: 'anna', name: 'Анна Иванова', role: 'SMM', stage: 'Собеседование' },
  { id: 'sergey', name: 'Сергей Петров', role: 'Frontend', stage: 'Тестовое задание' },
  { id: 'katya', name: 'Катя Орлова', role: 'Продюсер', stage: 'Отбор' }
];

const PIPELINE = [
  { id: 'sourcing', name: 'Поиск', count: 12 },
  { id: 'interview', name: 'Интервью', count: 5 },
  { id: 'offer', name: 'Офер', count: 2 }
];

const VACANCY_STAGE_RANGE = getStageRangeFor('project.vacancies');

export default function ProjectVacanciesPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="open-roles"
        title="Список ролей"
        description="Текущие вакансии и статус публикации."
        actions={[
          { id: 'publish', label: 'Опубликовать', toastMessage: 'TODO: Опубликовать вакансию', tone: 'primary' },
          { id: 'archive', label: 'Снять с публикации', toastMessage: 'TODO: Снять вакансию' }
        ]}
        roadmap={{
          sectionId: 'project.vacancies',
          status: 'DEMO',
          message: `Функции появятся на этапах ${VACANCY_STAGE_RANGE}. Сейчас — демо-режим.`
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {OPEN_ROLES.map((role) => (
            <div key={role.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{role.title}</p>
              <p className="text-xs text-neutral-400">Уровень: {role.level}</p>
              <p className="mt-2 text-xs text-neutral-500">Статус: {role.status}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="responses"
        title="Отклики"
        description="Кандидаты и текущий этап отбора."
        actions={[
          { id: 'compare', label: 'Сравнить', toastMessage: 'TODO: Сравнить кандидатов', tone: 'primary' },
          { id: 'interview', label: 'Назначить интервью', toastMessage: 'TODO: Назначить интервью' },
          { id: 'offer', label: 'Вынести офер', toastMessage: 'TODO: Отправить офер' }
        ]}
      >
        <div className="space-y-3">
          {RESPONSES.map((candidate) => (
            <div key={candidate.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{candidate.name}</p>
                <p className="text-xs text-neutral-400">Роль: {candidate.role}</p>
              </div>
              <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wide text-indigo-100">
                {candidate.stage}
              </span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="pipeline"
        title="Этапы найма"
        description="Флоу подбора и текущие показатели."
        actions={[{ id: 'adjust-pipeline', label: 'Настроить этапы', toastMessage: 'TODO: Настроить этапы' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {PIPELINE.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 text-center">
              <p className="text-sm font-semibold text-neutral-100">{stage.name}</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-200">{stage.count}</p>
              <p className="text-xs text-neutral-500">кандидатов</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
