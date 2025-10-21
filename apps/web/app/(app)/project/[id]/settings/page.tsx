import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';
import { flags } from '@/lib/flags';
import WorkflowEditorClient from './workflow-editor-client';

const GENERAL = [
  { id: 'name', label: 'Название проекта', value: 'Демо-проект' },
  { id: 'visibility', label: 'Видимость', value: 'Private' },
  { id: 'stage', label: 'Текущая стадия', value: 'Бриф' }
];

const INTEGRATIONS = [
  { id: 'slack', title: 'Slack', status: 'Подключено' },
  { id: 'figma', title: 'Figma', status: 'Подключено' },
  { id: 'notion', title: 'Notion', status: 'Отключено' }
];

const SECURITY = [
  { id: '2fa', title: '2FA', status: 'Включено' },
  { id: 'ip', title: 'IP фильтр', status: 'Черновик' }
];

type ProjectSettingsPageProps = {
  params: { id: string };
};

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  return (
    <ProjectPageFrame slug="settings">
      <ProjectSection
        id="general"
        title="Основные"
        description="Базовая информация о проекте."
        actions={[{ id: 'edit-general', label: 'Редактировать', toastMessage: 'TODO: Редактировать настройки', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {GENERAL.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-neutral-100">{item.value}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="integrations"
        title="Интеграции"
        description="Подключённые сервисы и статус синхронизации."
        actions={[{ id: 'connect', label: 'Подключить', toastMessage: 'TODO: Подключить интеграцию', tone: 'primary' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 text-center">
              <p className="text-sm font-semibold text-neutral-100">{integration.title}</p>
              <p className="text-xs text-neutral-400">{integration.status}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="security"
        title="Безопасность"
        description="Параметры безопасности и политики."
        actions={[{ id: 'update-security', label: 'Обновить', toastMessage: 'TODO: Обновить политику', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {SECURITY.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <span className="text-xs text-neutral-500">{item.status}</span>
              </div>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
      {flags.PROJECTS_V1 ? (
        <ProjectSection
          id="workflow"
          title="Workflow"
          description="Настройка статусов задач и канбана."
          actions={[]}
        >
          <WorkflowEditorClient projectId={params.id} />
        </ProjectSection>
      ) : null}
    </ProjectPageFrame>
  );
}
