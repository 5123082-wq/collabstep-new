import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const REPO_INFO = [
  { id: 'main', name: 'main', status: 'Green', builds: 12 },
  { id: 'develop', name: 'develop', status: 'Yellow', builds: 5 },
  { id: 'feature', name: 'feature/new-checkout', status: 'Pending', builds: 2 }
];

const PAGES = [
  { id: 'landing', title: 'Landing', tests: 'A/B', status: 'Активен' },
  { id: 'pricing', title: 'Pricing', tests: 'A/B', status: 'Запланирован' },
  { id: 'story', title: 'Story', tests: '-', status: 'В работе' }
];

const BUGS = [
  { id: 'checkout', title: 'Checkout не отправляет заказ', severity: 'High' },
  { id: 'mobile-ui', title: 'Съезжает карточка товара', severity: 'Medium' },
  { id: 'analytics', title: 'Дублируются события', severity: 'Low' }
];

export default function ProjectWebPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="repo"
        title="Репозиторий"
        description="Статус веток и последние билды."
        actions={[
          { id: 'build', label: 'Создать билд', toastMessage: 'TODO: Создать билд', tone: 'primary' },
          { id: 'deploy', label: 'Деплой', toastMessage: 'TODO: Запустить деплой' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {REPO_INFO.map((branch) => (
            <div key={branch.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{branch.name}</p>
              <p className="text-xs text-neutral-400">Статус: {branch.status}</p>
              <p className="mt-2 text-xs text-neutral-500">Билдов за неделю: {branch.builds}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="pages"
        title="Страницы"
        description="Управление страницами и A/B эксперименты."
        actions={[
          { id: 'create-page', label: 'Создать страницу', toastMessage: 'TODO: Создать страницу', tone: 'primary' },
          { id: 'ab-test', label: 'Запустить A/B', toastMessage: 'TODO: Запустить A/B тест' }
        ]}
      >
        <div className="space-y-3">
          {PAGES.map((page) => (
            <div key={page.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{page.title}</p>
                <p className="text-xs text-neutral-400">Эксперименты: {page.tests}</p>
              </div>
              <span className="text-xs text-neutral-500">{page.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="bugs"
        title="Баги"
        description="Управление дефектами и приоритизация."
        actions={[{ id: 'new-bug', label: 'Новая ошибка', toastMessage: 'TODO: Создать баг', tone: 'primary' }]}
      >
        <div className="space-y-3">
          {BUGS.map((bug) => (
            <div key={bug.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-neutral-100">{bug.title}</p>
              <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs uppercase tracking-wide text-red-200">
                {bug.severity}
              </span>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
