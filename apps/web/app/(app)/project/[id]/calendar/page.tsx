import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const TIMELINE_ITEMS = [
  { id: 'kickoff', title: 'Старт спринта', date: '15 октября', owner: 'PM' },
  { id: 'release', title: 'Релиз витрины', date: '28 октября', owner: 'Разработка' },
  { id: 'retro', title: 'Ретроспектива', date: '30 октября', owner: 'Команда' }
];

const TEAM_CALENDAR = [
  { id: 'design', title: 'Дизайн команда', focus: 'Фокус на бренд-гайд', members: 3 },
  { id: 'tech', title: 'Разработка', focus: 'API каталога', members: 5 },
  { id: 'marketing', title: 'Маркетинг', focus: 'Запуск кампании', members: 2 }
];

const SYNC_CHANNELS = [
  { id: 'google-calendar', title: 'Google Calendar', status: 'Синхронизировано' },
  { id: 'outlook', title: 'Outlook', status: 'Ожидает подтверждения' },
  { id: 'slack', title: 'Slack-уведомления', status: 'Активно' }
];

export default function ProjectCalendarPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="timeline"
        title="Дорожная карта"
        description="Ключевые события, дедлайны и зависимости."
        actions={[
          { id: 'add-milestone', label: 'Добавить событие', toastMessage: 'TODO: Добавить событие', tone: 'primary' },
          { id: 'export-timeline', label: 'Экспортировать', toastMessage: 'TODO: Экспортировать календарь' }
        ]}
      >
        <div className="space-y-3">
          {TIMELINE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <p className="text-xs text-neutral-400">Ответственный: {item.owner}</p>
              </div>
              <span className="text-xs text-neutral-500">{item.date}</span>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="team-calendar"
        title="Календари команд"
        description="Загрузка по кластерам и ближайшие активности."
        actions={[
          { id: 'manage-capacity', label: 'Управлять загрузкой', toastMessage: 'TODO: Управлять загрузкой', tone: 'primary' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {TEAM_CALENDAR.map((team) => (
            <div key={team.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{team.title}</p>
              <p className="mt-1 text-xs text-neutral-400">{team.focus}</p>
              <p className="mt-3 text-xs text-neutral-500">Участников: {team.members}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="sync"
        title="Синхронизации"
        description="Интеграции календаря и уведомлений."
        actions={[
          { id: 'add-sync', label: 'Подключить календарь', toastMessage: 'TODO: Подключить календарь', tone: 'primary' },
          { id: 'manage-notifications', label: 'Управлять уведомлениями', toastMessage: 'TODO: Управлять уведомлениями' }
        ]}
      >
        <div className="space-y-3">
          {SYNC_CHANNELS.map((channel) => (
            <div key={channel.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{channel.title}</p>
                <span className="text-xs text-neutral-500">{channel.status}</span>
              </div>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
