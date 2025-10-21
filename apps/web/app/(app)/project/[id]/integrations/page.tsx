import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const CONNECTED = [
  { id: 'slack', title: 'Slack', owner: 'Коммуникации', status: 'Активно' },
  { id: 'figma', title: 'Figma', owner: 'Дизайн', status: 'Активно' },
  { id: 'github', title: 'GitHub', owner: 'Разработка', status: 'Синхронизация' }
];

const MARKETPLACE = [
  { id: 'notion', title: 'Notion', description: 'Документация, базы знаний' },
  { id: 'jira', title: 'Jira', description: 'Продвинутое управление задачами' },
  { id: 'powerbi', title: 'Power BI', description: 'Визуализация аналитики' }
];

const API_KEYS = [
  { id: 'public', title: 'Public API', lastUsed: '2 часа назад', status: 'Активен' },
  { id: 'service', title: 'Service account', lastUsed: '5 дней назад', status: 'Черновик' }
];

export default function ProjectIntegrationsPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="connected"
        title="Подключённые интеграции"
        description="Текущие коннекторы и их владельцы."
        actions={[
          { id: 'disconnect', label: 'Отключить', toastMessage: 'TODO: Отключить интеграцию' },
          { id: 'connect', label: 'Подключить', toastMessage: 'TODO: Подключить интеграцию', tone: 'primary' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {CONNECTED.map((integration) => (
            <div key={integration.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{integration.title}</p>
              <p className="mt-1 text-xs text-neutral-400">Команда: {integration.owner}</p>
              <p className="text-xs text-neutral-500">Статус: {integration.status}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="marketplace"
        title="Маркетплейс"
        description="Расширение экосистемы за счёт внешних сервисов."
        actions={[
          { id: 'open-marketplace', label: 'Открыть каталог', toastMessage: 'TODO: Открыть каталог', tone: 'primary' }
        ]}
      >
        <div className="space-y-3">
          {MARKETPLACE.map((integration) => (
            <div key={integration.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{integration.title}</p>
              <p className="mt-2 text-xs text-neutral-400">{integration.description}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="api"
        title="API и ключи"
        description="Управление доступом для сервисных интеграций."
        actions={[
          { id: 'create-key', label: 'Создать ключ', toastMessage: 'TODO: Создать ключ', tone: 'primary' },
          { id: 'revoke-key', label: 'Отозвать', toastMessage: 'TODO: Отозвать ключ' }
        ]}
      >
        <div className="space-y-3">
          {API_KEYS.map((key) => (
            <div key={key.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-100">{key.title}</p>
                  <p className="text-xs text-neutral-400">Последнее использование: {key.lastUsed}</p>
                </div>
                <span className="text-xs text-neutral-500">{key.status}</span>
              </div>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
