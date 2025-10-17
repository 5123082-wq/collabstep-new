import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';
import { getStageRangeFor } from '@/lib/roadmap';

const BUDGET = [
  { id: 'plan', title: 'План', value: '5 000 000 ₽' },
  { id: 'fact', title: 'Факт', value: '3 200 000 ₽' },
  { id: 'forecast', title: 'Прогноз', value: '4 800 000 ₽' }
];

const ESCROW = [
  { id: 'design', title: 'Дизайн-партия', status: 'Открыт', amount: '500 000 ₽' },
  { id: 'production', title: 'Производство мерча', status: 'На пополнении', amount: '750 000 ₽' }
];

const INVOICES = [
  { id: 'inv-501', title: 'Счёт за дизайн-спринт', status: 'Оплачен' },
  { id: 'inv-518', title: 'Аванс по мобильной разработке', status: 'Ожидает оплаты' },
  { id: 'inv-533', title: 'Консультация AI-команды', status: 'Подписан' }
];

const PROJECT_FINANCE_STAGE = getStageRangeFor('project.finance');

export default function ProjectFinancePage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="budget"
        title="Бюджет"
        description="Контроль плановых и фактических значений."
        actions={[
          { id: 'edit-budget', label: 'Редактировать', toastMessage: 'TODO: Редактировать бюджет', tone: 'primary' },
          { id: 'approve-budget', label: 'Утвердить', toastMessage: 'TODO: Утвердить бюджет' }
        ]}
        roadmap={{
          sectionId: 'project.finance',
          status: 'COMING_SOON',
          message: `Финансы проекта включатся на этапе ${PROJECT_FINANCE_STAGE} (этап ${PROJECT_FINANCE_STAGE} — тестовые платежи). Сейчас — демо-режим.`
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {BUDGET.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{item.title}</p>
              <p className="mt-2 text-lg font-semibold text-neutral-100">{item.value}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="escrow"
        title="Эскроу"
        description="Счета с защитой сделки и их статусы."
        actions={[
          { id: 'open-escrow', label: 'Открыть', toastMessage: 'TODO: Открыть эскроу', tone: 'primary' },
          { id: 'unlock', label: 'Разблокировать', toastMessage: 'TODO: Разблокировать эскроу' }
        ]}
      >
        <div className="space-y-3">
          {ESCROW.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.amount}</p>
              </div>
              <span className="text-xs text-neutral-500">{item.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="invoices"
        title="Счета"
        description="Сформированные документы и их статусы."
        actions={[
          { id: 'generate-invoice', label: 'Сформировать', toastMessage: 'TODO: Сформировать счёт', tone: 'primary' },
          { id: 'sign-invoice', label: 'Подписать', toastMessage: 'TODO: Подписать счёт' },
          { id: 'download-invoice', label: 'Скачать', toastMessage: 'TODO: Скачать счёт' }
        ]}
      >
        <div className="space-y-3">
          {INVOICES.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{invoice.title}</p>
              <p className="text-xs text-neutral-400">{invoice.status}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
