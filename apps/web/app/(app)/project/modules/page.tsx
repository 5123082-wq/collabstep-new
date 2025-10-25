const MODULES = [
  {
    id: 'tasks',
    title: 'Задачи и дорожки',
    description:
      'Управление рабочими процессами через канбан-доски, спринты и контроль сроков выполнения.',
    highlights: [
      { id: 'kanban', title: 'Канбан и статусы', description: 'Настраиваемые воронки, доски и чек-листы для команд любой величины.' },
      { id: 'iterations', title: 'Итерации и спринты', description: 'Планирование циклов, velocity и точки контроля прогресса.' }
    ],
    chips: ['Автоматизация статусов', 'Повторяющиеся задачи', 'Подзадачи и чек-листы', 'Шаблоны процессов']
  },
  {
    id: 'calendar',
    title: 'Календарь и планирование',
    description: 'Общий календарь, диаграммы Гантта и синхронизация с личными расписаниями.',
    highlights: [
      { id: 'timeline', title: 'Диаграмма Гантта', description: 'Визуализация зависимостей и критического пути проекта.' },
      { id: 'sync', title: 'Синхронизации', description: 'Экспорт событий в Google Calendar, Outlook и Slack-уведомления.' }
    ],
    chips: ['Планирование ресурсов', 'Напоминания', 'Отслеживание дедлайнов', 'Шаблоны спринтов']
  },
  {
    id: 'team',
    title: 'Команда и роли',
    description: 'Матрица ответственности, онбординг и контроль загрузки специалистов.',
    highlights: [
      { id: 'roles', title: 'Роли и доступы', description: 'Гибкие права для фаундеров, проджектов, исполнителей и подрядчиков.' },
      { id: 'capacity', title: 'Загрузка команды', description: 'Балансировка нагрузки, отслеживание отпусков и доступности.' }
    ],
    chips: ['Онбординг', 'Профили участников', 'Ротация ролей', 'Запросы на участие']
  },
  {
    id: 'docs',
    title: 'Документы и файлы',
    description: 'Централизованное хранилище, шаблоны договоров и контроль версий.',
    highlights: [
      { id: 'storage', title: 'Хранилище', description: 'Категории, поиск по содержимому и предпросмотр без скачивания.' },
      { id: 'templates', title: 'Док-шаблоны', description: 'Автозаполнение реквизитов и быстрые согласования.' }
    ],
    chips: ['История версий', 'Совместное редактирование', 'Подпись документов', 'Резервные копии']
  },
  {
    id: 'finance',
    title: 'Финансы и бюджеты',
    description: 'Контроль план/факт, управление оплатами и прозрачность кэш-флоу.',
    highlights: [
      { id: 'budget', title: 'Бюджетирование', description: 'Настройка статей, лимитов и сценарное моделирование.' },
      { id: 'payments', title: 'Платежи', description: 'Эскроу, счета, акты и автоматические напоминания.' }
    ],
    chips: ['Прогнозирование', 'Расходы по задачам', 'Интеграция с бухгалтерией', 'Дэшборды финансов']
  },
  {
    id: 'analytics',
    title: 'Аналитика и отчёты',
    description: 'KPI, контроль SLA и экспорт отчётов в понятные форматы.',
    highlights: [
      { id: 'dashboards', title: 'Дашборды', description: 'Настраиваемые панели показателей, фильтры и сохранённые виджеты.' },
      { id: 'reports', title: 'Отчётность', description: 'Готовые шаблоны, сравнения периодов и выгрузка в XLSX/CSV.' }
    ],
    chips: ['SLA-мониторинг', 'Аналитика по командам', 'Прогноз загрузки', 'Экспорт для инвесторов']
  },
  {
    id: 'automations',
    title: 'Автоматизации',
    description: 'Триггеры, боты и сценарии, которые сокращают ручную работу.',
    highlights: [
      { id: 'rules', title: 'Правила и триггеры', description: 'Условия по статусам, срокам и активности участников.' },
      { id: 'bots', title: 'Боты и сценарии', description: 'Интеграция с AI-ассистентами и автогенерация задач.' }
    ],
    chips: ['Webhook-и', 'Автопроставление ответственных', 'Готовые рецепты', 'Расширяемые коннекторы']
  },
  {
    id: 'risk',
    title: 'Риски и качество',
    description: 'Реестр рисков, контроль изменений и аудит качества поставок.',
    highlights: [
      { id: 'register', title: 'Реестр рисков', description: 'Категоризация, оценка влияния и план реакции.' },
      { id: 'qa', title: 'Контроль качества', description: 'Чек-листы приёмки и автоматические напоминания ревью.' }
    ],
    chips: ['Эскалации', 'Регламенты', 'История инцидентов', 'Согласование изменений']
  },
  {
    id: 'clients',
    title: 'Клиентские отношения',
    description: 'CRM для стейкхолдеров: коммуникации, SLA и satisfaction.',
    highlights: [
      { id: 'pipeline', title: 'Воронка и сделки', description: 'Канбан по этапам, forecast и управление договорами.' },
      { id: 'communications', title: 'Коммуникации', description: 'История писем, встречи и опросы удовлетворённости.' }
    ],
    chips: ['Портал клиента', 'SLA-контроль', 'Отзывы', 'Шаблоны рассылок']
  },
  {
    id: 'integrations',
    title: 'Интеграции и экосистема',
    description: 'Подключение внешних сервисов, API и настройка обмена данными.',
    highlights: [
      { id: 'api', title: 'API и SDK', description: 'Документация, ключи доступа и управление версиями.' },
      { id: 'connectors', title: 'Коннекторы', description: 'Готовые связки с GitHub, Notion, Slack и BI-системами.' }
    ],
    chips: ['Маркетплейс приложений', 'Single Sign-On', 'Webhooks', 'Data Lake']
  }
];

import ProjectPageFrame from '@/components/project/ProjectPageFrame';

export default function ProjectModulesPage() {
  return (
    <ProjectPageFrame
      slug="modules"
      title="Конструктор управления проектами"
      description="Собрали карту ключевых разделов будущей CRM: от таск-трекинга до финансов, аналитики и клиентских коммуникаций. Каждый модуль получит отдельный функционал и настраиваемые сценарии."
    >
      {MODULES.map((module) => (
        <section
          key={module.id}
          id={module.id}
          className="scroll-mt-24 rounded-3xl border border-neutral-900 bg-neutral-950/80 p-6 shadow-sm shadow-neutral-950/10"
          aria-labelledby={`${module.id}-title`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 id={`${module.id}-title`} className="text-xl font-semibold text-white">
                {module.title}
              </h2>
              <p className="text-sm text-neutral-400">{module.description}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              В разработке
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {module.highlights.map((highlight) => (
              <div key={highlight.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
                <p className="text-sm font-semibold text-neutral-200">{highlight.title}</p>
                <p className="mt-2 text-sm text-neutral-400">{highlight.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {module.chips.map((chip) => (
              <span key={chip} className="rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs text-neutral-300">
                {chip}
              </span>
            ))}
          </div>
        </section>
      ))}
    </ProjectPageFrame>
  );
}
