import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const PERSONAS = [
  { id: 'makers', title: 'Makers', need: 'Премиальный мерч и доступ к закрытым релизам' },
  { id: 'collectors', title: 'Collectors', need: 'Лимитированные дропы и сертификаты' },
  { id: 'partners', title: 'Partners', need: 'Готовые наборы для коллабораций' }
];

const CAMPAIGNS = [
  { id: 'launch', title: 'Запуск витрины', date: '15 ноября', status: 'Запланировано' },
  { id: 'black-friday', title: 'Black Friday', date: '29 ноября', status: 'Готово' },
  { id: 'community', title: 'Сообщество', date: 'Каждый четверг', status: 'Идёт' }
];

const CALENDAR_ITEMS = [
  { id: 'week45', title: 'Неделя 45', note: 'Съёмка контента + публикации' },
  { id: 'week46', title: 'Неделя 46', note: 'A/B тест баннеров и реферальная акция' }
];

export default function ProjectMarketingPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="personas"
        title="Персоны / JTBD"
        description="Сегменты аудитории и их задачи."
        actions={[{ id: 'edit-personas', label: 'Редактировать', toastMessage: 'TODO: Редактировать персоны', tone: 'primary' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {PERSONAS.map((persona) => (
            <div key={persona.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{persona.title}</p>
              <p className="mt-2 text-xs text-neutral-400">{persona.need}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="campaigns"
        title="Кампании"
        description="Маркетинговые активности и их статус."
        actions={[
          { id: 'plan-campaign', label: 'Запланировать', toastMessage: 'TODO: Запланировать кампанию', tone: 'primary' },
          { id: 'launch-campaign', label: 'Запустить', toastMessage: 'TODO: Запустить кампанию' }
        ]}
      >
        <div className="space-y-3">
          {CAMPAIGNS.map((campaign) => (
            <div key={campaign.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{campaign.title}</p>
                <p className="text-xs text-neutral-400">Дата: {campaign.date}</p>
              </div>
              <span className="text-xs text-neutral-500">{campaign.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="calendar"
        title="Календарь"
        description="План публикаций и активности по неделям."
        actions={[{ id: 'publish', label: 'Опубликовать', toastMessage: 'TODO: Опубликовать календарь', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {CALENDAR_ITEMS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <p className="text-xs text-neutral-400">{item.note}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
