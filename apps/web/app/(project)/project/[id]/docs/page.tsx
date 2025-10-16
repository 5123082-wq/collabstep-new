import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const NDA_LIST = [
  { id: 'partner', title: 'NDA партнёра', status: 'Подписать' },
  { id: 'contractor', title: 'NDA подрядчика', status: 'Подписано' }
];

const BRAND_DOCS = [
  { id: 'brandbook', title: 'Брендбук', status: 'Готов', format: 'PDF' },
  { id: 'guidelines', title: 'Guidelines', status: 'Черновик', format: 'Notion' }
];

const ACCESS = [
  { id: 'figma', title: 'Figma', granted: 'Команда дизайна' },
  { id: 'repo', title: 'GitHub', granted: 'Разработка' },
  { id: 'drive', title: 'Google Drive', granted: 'Маркетинг' }
];

export default function ProjectDocsPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="nda"
        title="NDA / Лицензии"
        description="Юридические документы и их статусы."
        actions={[{ id: 'sign', label: 'Подписать', toastMessage: 'TODO: Подписать документ', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {NDA_LIST.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-neutral-100">{doc.title}</p>
              <span className="text-xs text-neutral-500">{doc.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="brandbook"
        title="Брендбук"
        description="Основные материалы и форматы."
        actions={[
          { id: 'open-web', label: 'Открыть web-версию', toastMessage: 'TODO: Открыть брендбук', tone: 'primary' },
          { id: 'export-pdf', label: 'Экспорт PDF', toastMessage: 'TODO: Экспортировать брендбук' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {BRAND_DOCS.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{doc.title}</p>
              <p className="text-xs text-neutral-400">{doc.status} · {doc.format}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="access"
        title="Доступы"
        description="Контроль прав и выдача доступа команде."
        actions={[{ id: 'grant-access', label: 'Выдать доступ', toastMessage: 'TODO: Выдать доступ', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {ACCESS.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{entry.title}</p>
              <p className="text-xs text-neutral-400">Доступ: {entry.granted}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
