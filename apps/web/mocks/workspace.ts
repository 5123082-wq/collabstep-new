import type {
  WorkspaceAnalytics,
  WorkspaceAutomation,
  WorkspaceData,
  WorkspaceEvent,
  WorkspaceFile,
  WorkspaceIntegration,
  WorkspaceMetric,
  WorkspaceModule,
  WorkspaceRoadmap,
  WorkspaceSetting,
  WorkspaceTask,
  WorkspaceTeamMember
} from '@/types/workspace';

const metrics: WorkspaceMetric[] = [
  { id: 'active-projects', label: 'Активных проектов', value: 8, unit: '', trend: 12 },
  { id: 'tasks-due', label: 'Задач к дедлайну', value: 17, unit: '', trend: -5 },
  { id: 'team-load', label: 'Средняя загрузка', value: 72, unit: '%', trend: 4 },
  { id: 'automation-coverage', label: 'Покрытие автоматизаций', value: 45, unit: '%', trend: 8 }
];

const roadmaps: WorkspaceRoadmap[] = [
  { id: 'product-launch', name: 'Запуск продукта', owner: 'Анна Крылова', progress: 68, stage: 'Разработка' },
  { id: 'marketing', name: 'Маркетинговая кампания', owner: 'Илья Горин', progress: 42, stage: 'Подготовка' },
  { id: 'mobile', name: 'Мобильное приложение', owner: 'Мария Звонарёва', progress: 24, stage: 'Прототипирование' }
];

const tasks: WorkspaceTask[] = [
  { id: 'task-1', title: 'Подготовить презентацию к демо', status: 'in-progress', owner: 'Виктория Чжан', dueDate: '2024-08-02', priority: 'high' },
  { id: 'task-2', title: 'Настроить интеграцию CRM', status: 'review', owner: 'Алексей Панкратов', dueDate: '2024-08-05', priority: 'medium' },
  { id: 'task-3', title: 'Закрыть спринт 21', status: 'done', owner: 'Сергей Мацкевич', dueDate: '2024-07-26', priority: 'high' },
  { id: 'task-4', title: 'Собрать фидбек с клиентов', status: 'backlog', owner: 'Наталья Ливанова', dueDate: '2024-08-09', priority: 'medium' },
  { id: 'task-5', title: 'Запустить сценарий автоматизации', status: 'in-progress', owner: 'Игорь Носов', dueDate: '2024-07-31', priority: 'low' }
];

const events: WorkspaceEvent[] = [
  { id: 'event-1', title: 'Демо заказчику', type: 'meeting', date: '2024-07-25T12:00:00+03:00', owner: 'Анна Крылова' },
  { id: 'event-2', title: 'Релиз версии 1.4', type: 'milestone', date: '2024-07-30T10:00:00+03:00', owner: 'Мария Звонарёва' },
  { id: 'event-3', title: 'Дедлайн onboarding пакета', type: 'deadline', date: '2024-08-04T18:00:00+03:00', owner: 'Илья Горин' }
];

const team: WorkspaceTeamMember[] = [
  { id: 'member-1', name: 'Анна Крылова', role: 'Руководитель проекта', focus: 'Запуск продукта', allocation: 90, status: 'busy' },
  { id: 'member-2', name: 'Виктория Чжан', role: 'Дизайнер', focus: 'UI-кит', allocation: 75, status: 'available' },
  { id: 'member-3', name: 'Сергей Мацкевич', role: 'Разработчик', focus: 'Core-модуль', allocation: 95, status: 'busy' },
  { id: 'member-4', name: 'Мария Звонарёва', role: 'Аналитик', focus: 'Гипотезы роста', allocation: 60, status: 'available' },
  { id: 'member-5', name: 'Илья Горин', role: 'Маркетолог', focus: 'Активация', allocation: 55, status: 'vacation' }
];

const files: WorkspaceFile[] = [
  { id: 'file-1', name: 'Roadmap Q3.pdf', type: 'Документ', size: '4.2 МБ', updatedAt: '2024-07-20T09:10:00+03:00', owner: 'Анна Крылова' },
  { id: 'file-2', name: 'UI-kit.fig', type: 'Макет', size: '12.8 МБ', updatedAt: '2024-07-22T14:45:00+03:00', owner: 'Виктория Чжан' },
  { id: 'file-3', name: 'CRM-sync.json', type: 'Настройки', size: '180 КБ', updatedAt: '2024-07-18T17:25:00+03:00', owner: 'Игорь Носов' }
];

const analytics: WorkspaceAnalytics[] = [
  { id: 'metric-velocity', metric: 'Velocity', value: 28, change: 6, period: 'Спринт 21' },
  { id: 'metric-conversion', metric: 'Конверсия онбординга', value: 41, change: 3, period: 'Июль' },
  { id: 'metric-nps', metric: 'NPS клиентов', value: 62, change: -4, period: 'Квартал' }
];

const automations: WorkspaceAutomation[] = [
  { id: 'auto-1', name: 'Синхронизация CRM → Slack', trigger: 'Обновление сделки', status: 'active', owner: 'Игорь Носов' },
  { id: 'auto-2', name: 'Отправка онбординг-писем', trigger: 'Новый клиент', status: 'paused', owner: 'Анна Крылова' },
  { id: 'auto-3', name: 'Создание задач из формы', trigger: 'Запрос обратной связи', status: 'draft', owner: 'Сергей Мацкевич' }
];

const modules: WorkspaceModule[] = [
  { id: 'module-1', name: 'CRM-центр', owner: 'Анна Крылова', progress: 78, health: 'on-track', focus: 'Сделки и клиенты' },
  { id: 'module-2', name: 'Задачи и дорожки', owner: 'Сергей Мацкевич', progress: 52, health: 'at-risk', focus: 'Автоматизация' },
  { id: 'module-3', name: 'Портал исполнителей', owner: 'Виктория Чжан', progress: 34, health: 'on-track', focus: 'Опыт исполнителя' }
];

const integrations: WorkspaceIntegration[] = [
  { id: 'integration-1', name: 'Notion', status: 'connected', description: 'Синхронизация базы знаний и чек-листов.', updatedAt: '2024-07-21T11:20:00+03:00' },
  { id: 'integration-2', name: 'Slack', status: 'connected', description: 'Уведомления о статусах задач и релизах.', updatedAt: '2024-07-23T08:15:00+03:00' },
  { id: 'integration-3', name: 'Jira', status: 'error', description: 'Требуется повторная авторизация.', updatedAt: '2024-07-19T16:40:00+03:00' },
  { id: 'integration-4', name: 'Power BI', status: 'not-configured', description: 'Доступен новый коннектор.', updatedAt: '2024-07-17T09:00:00+03:00' }
];

const settings: WorkspaceSetting[] = [
  { id: 'settings-language', name: 'Язык рабочей области', description: 'Установлен русский язык интерфейса.', value: 'Русский', category: 'general' },
  { id: 'settings-access', name: 'Политика доступа', description: 'Утверждение заявок руководителем.', value: 'Ручное подтверждение', category: 'access' },
  { id: 'settings-alerts', name: 'Уведомления о рисках', description: 'Ежедневная рассылка в Slack.', value: 'Включено', category: 'notifications' }
];

export const workspaceSnapshot: WorkspaceData = {
  metrics,
  roadmaps,
  tasks,
  events,
  team,
  files,
  analytics,
  automations,
  modules,
  integrations,
  settings
};
