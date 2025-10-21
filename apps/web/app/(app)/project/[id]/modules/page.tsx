import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const MODULE_STATUS = [
  { id: 'tasks', title: 'Задачи', status: 'Готово', owner: 'PM' },
  { id: 'calendar', title: 'Календарь', status: 'В разработке', owner: 'PMO' },
  { id: 'finance', title: 'Финансы', status: 'Планируется', owner: 'Finance' }
];

const MODULE_REQUESTS = [
  { id: 'crm', title: 'CRM подрядчиков', votes: 12 },
  { id: 'knowledge', title: 'База знаний', votes: 9 },
  { id: 'quality', title: 'Контроль качества', votes: 6 }
];

const MODULE_LIBRARY = [
  { id: 'marketing-suite', title: 'Маркетинговый пакет', description: 'Кампании, воронки, отчёты', status: 'Beta' },
  { id: 'ops-suite', title: 'Операционный пакет', description: 'Автоматизации и интеграции', status: 'Alpha' }
];

export default function ProjectModulesWorkspacePage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="catalog"
        title="Каталог модулей"
        description="Активные и планируемые блоки в рабочем пространстве."
        actions={[
          { id: 'create-module', label: 'Создать модуль', toastMessage: 'TODO: Создать модуль', tone: 'primary' },
          { id: 'manage-access', label: 'Права доступа', toastMessage: 'TODO: Настроить доступ' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {MODULE_STATUS.map((module) => (
            <div key={module.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{module.title}</p>
              <p className="mt-1 text-xs text-neutral-400">Статус: {module.status}</p>
              <p className="text-xs text-neutral-500">Куратор: {module.owner}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="library"
        title="Пакеты и шаблоны"
        description="Сборники модулей для типовых сценариев."
        actions={[
          { id: 'install-package', label: 'Установить пакет', toastMessage: 'TODO: Установить пакет', tone: 'primary' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {MODULE_LIBRARY.map((module) => (
            <div key={module.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{module.title}</p>
                <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                  {module.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{module.description}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="requests"
        title="Запросы команд"
        description="Предложения по развитию экосистемы модулей."
        actions={[
          { id: 'add-request', label: 'Оставить запрос', toastMessage: 'TODO: Оставить запрос', tone: 'primary' }
        ]}
      >
        <div className="space-y-3">
          {MODULE_REQUESTS.map((request) => (
            <div key={request.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{request.title}</p>
                <span className="text-xs text-neutral-500">Голосов: {request.votes}</span>
              </div>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
