import ProjectPageFrame from '@/components/project/ProjectPageFrame';
import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const RULES = [
  { id: 'status', title: 'Статусы задач', trigger: 'При переходе в Review', action: 'Назначить ревьюера' },
  { id: 'sla', title: 'SLA реагирования', trigger: 'Просрочка > 12 часов', action: 'Отправить напоминание в Slack' }
];

const BOTS = [
  { id: 'assistant', title: 'AI ассистент', description: 'Генерирует чек-листы и подсказывает следующие шаги.' },
  { id: 'handoff', title: 'Handoff бот', description: 'Собирает бриф и отправляет итог заказчику.' }
];

const RECIPES = [
  { id: 'onboarding', title: 'Онбординг команды', usage: 'Шаблон из 8 шагов' },
  { id: 'launch', title: 'Запуск кампании', usage: 'Сценарий с интеграцией календаря' },
  { id: 'qa', title: 'QA контроль', usage: 'Автоматические чек-листы' }
];

export default function ProjectAutomationsPage() {
  return (
    <ProjectPageFrame slug="automations">
      <ProjectSection
        id="rules"
        title="Правила и триггеры"
        description="Реагирование на изменения статусов, сроков и событий."
        actions={[
          { id: 'create-rule', label: 'Создать правило', toastMessage: 'TODO: Создать правило', tone: 'primary' },
          { id: 'view-history', label: 'История запусков', toastMessage: 'TODO: Показать историю' }
        ]}
      >
        <div className="space-y-3">
          {RULES.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{rule.title}</p>
              <p className="mt-1 text-xs text-neutral-400">Триггер: {rule.trigger}</p>
              <p className="text-xs text-neutral-500">Действие: {rule.action}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="bots"
        title="Боты и сценарии"
        description="Автоматизация рутинных задач и коммуникаций."
        actions={[
          { id: 'add-bot', label: 'Подключить бота', toastMessage: 'TODO: Подключить бота', tone: 'primary' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {BOTS.map((bot) => (
            <div key={bot.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{bot.title}</p>
              <p className="mt-2 text-xs text-neutral-400">{bot.description}</p>
            </div>
          ))}
        </div>
      </ProjectSection>

      <ProjectSection
        id="recipes"
        title="Библиотека рецептов"
        description="Готовые сценарии и шаблоны автоматизаций."
        actions={[
          { id: 'import-recipe', label: 'Импортировать', toastMessage: 'TODO: Импортировать рецепт' },
          { id: 'share-recipe', label: 'Поделиться', toastMessage: 'TODO: Поделиться рецептом' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {RECIPES.map((recipe) => (
            <div key={recipe.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{recipe.title}</p>
              <p className="mt-2 text-xs text-neutral-400">{recipe.usage}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </ProjectPageFrame>
  );
}
