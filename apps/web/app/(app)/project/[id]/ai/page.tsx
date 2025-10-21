import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const SESSIONS = [
  { id: 'brainstorm', title: 'AI-бриф: идеи для дропа', status: 'Готово' },
  { id: 'campaign', title: 'Маркетинговые сообщения', status: 'В работе' },
  { id: 'support', title: 'Скрипты поддержки', status: 'Черновик' }
];

const HISTORY = [
  { id: '2024-10-01', title: 'Генерация описаний', owner: 'Оля Степанова' },
  { id: '2024-10-03', title: 'Финансовые сценарии', owner: 'Максим Карпов' }
];

export default function ProjectAIPage() {
  return (
    <ProjectPageFrame slug="ai">
      <ProjectSection
        id="sessions"
        title="AI-сессии"
        description="Сценарии с AI-ассистентом в рамках проекта."
        actions={[
          { id: 'start-session', label: 'Запустить', toastMessage: 'TODO: Запустить AI-сессию', tone: 'primary' },
          { id: 'edit-prompt', label: 'Править промт', toastMessage: 'TODO: Править промт' },
          { id: 'save-doc', label: 'Сохранить в Документы', toastMessage: 'TODO: Сохранить результат' }
        ]}
      >
        <div className="space-y-3">
          {SESSIONS.map((session) => (
            <div key={session.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{session.title}</p>
                <span className="text-xs text-neutral-500">{session.status}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">Последний запуск: 2 часа назад</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="history"
        title="История"
        description="Результаты AI-сессий и сравнения версий."
        actions={[
          { id: 'compare', label: 'Сравнить', toastMessage: 'TODO: Сравнить версии', tone: 'primary' },
          { id: 'accept', label: 'Принять', toastMessage: 'TODO: Принять версию' }
        ]}
      >
        <div className="space-y-3">
          {HISTORY.map((record) => (
            <div key={record.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{record.title}</p>
                <p className="text-xs text-neutral-400">{record.owner}</p>
              </div>
              <span className="text-xs text-neutral-500">{record.id}</span>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </ProjectPageFrame>
  );
}
