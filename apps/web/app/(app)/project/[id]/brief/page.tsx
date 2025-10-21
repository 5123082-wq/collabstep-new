import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const SUMMARY_POINTS = [
  'Цель — запустить витрину мерча сообщества к запуску продукта.',
  'Фокус на интеграции с AI-конструктором для персонализации.',
  'Необходимо поддержать партнёрские кампании с блогерами.'
];

const AUDIENCE_SEGMENTS = [
  { id: 'founders', name: 'Фаундеры', need: 'Мерч для команды и инвесторов' },
  { id: 'community', name: 'Сообщество', need: 'Ограниченные релизы и подарки' },
  { id: 'partners', name: 'Партнёры', need: 'Промо-наборы для коллабораций' }
];

const SUCCESS_CRITERIA = [
  { id: 'launch', title: 'Запуск витрины', value: '30 ноября' },
  { id: 'gmv', title: 'Выручка за первые 30 дней', value: '1.2 млн ₽' },
  { id: 'nps', title: 'NPS покупателей', value: '70+' }
];

export default function ProjectBriefPage() {
  return (
    <ProjectPageFrame slug="brief">
      <ProjectSection
        id="summary"
        title="Ключевые тезисы"
        description="Краткое содержание брифа и стратегические цели проекта."
        actions={[{ id: 'edit-summary', label: 'Редактировать бриф', toastMessage: 'TODO: Редактировать бриф', tone: 'primary' }]}
      >
        <ul className="space-y-3">
          {SUMMARY_POINTS.map((item) => (
            <li key={item} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 text-sm text-neutral-200">
              {item}
            </li>
          ))}
        </ul>
      </ProjectSection>
      <ProjectSection
        id="audience"
        title="Целевая аудитория"
        description="Кому предназначен продукт и какие сценарии закрывает."
        actions={[{ id: 'update-audience', label: 'Обновить портреты', toastMessage: 'TODO: Обновить портреты' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {AUDIENCE_SEGMENTS.map((segment) => (
            <div key={segment.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{segment.name}</p>
              <p className="mt-2 text-xs text-neutral-400">{segment.need}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="success"
        title="Критерии успеха"
        description="Измеримые показатели, подтверждающие успешное завершение проекта."
        actions={[{ id: 'share-success', label: 'Поделиться брифом', toastMessage: 'TODO: Поделиться брифом' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {SUCCESS_CRITERIA.map((criterion) => (
            <div key={criterion.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{criterion.title}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-100">{criterion.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </ProjectPageFrame>
  );
}
