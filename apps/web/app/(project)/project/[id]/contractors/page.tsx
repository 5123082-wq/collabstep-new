import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';
import { getStageRangeFor } from '@/lib/roadmap';

const CATALOG = [
  { id: 'print', name: 'Print Studio', specialty: 'Печать мерча', rating: '4.8' },
  { id: 'logistics', name: 'QuickShip', specialty: 'Логистика', rating: '4.6' },
  { id: 'packaging', name: 'Pack&Co', specialty: 'Подарочная упаковка', rating: '4.9' }
];

const ORDERS = [
  { id: 'hoodie', title: 'Партия худи', status: 'В производстве' },
  { id: 'stickers', title: 'Стикеры для дропа', status: 'Ожидание оплаты' },
  { id: 'boxes', title: 'Подарочные коробки', status: 'Готово' }
];

const CONTRACTS = [
  { id: 'nda', title: 'NDA Print Studio', status: 'Подписано' },
  { id: 'supply', title: 'Контракт на поставку', status: 'Требует подписи' }
];

const CONTRACTOR_STAGE_RANGE = getStageRangeFor('project.contractors');

export default function ProjectContractorsPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="catalog"
        title="Каталог"
        description="Подрядчики и их специализация."
        actions={[{ id: 'request-estimate', label: 'Запросить смету', toastMessage: 'TODO: Запросить смету', tone: 'primary' }]}
        roadmap={{
          sectionId: 'project.contractors',
          status: 'COMING_SOON',
          message: `Сметы и заказы — этап ${CONTRACTOR_STAGE_RANGE}. Сейчас — демо-каталог.`
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {CATALOG.map((contractor) => (
            <div key={contractor.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{contractor.name}</p>
              <p className="text-xs text-neutral-400">{contractor.specialty}</p>
              <p className="mt-2 text-xs text-neutral-500">Рейтинг: {contractor.rating}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="orders"
        title="Заказы"
        description="Статус текущих заказов и оплаты."
        actions={[
          { id: 'create-spec', label: 'Сформировать ТЗ', toastMessage: 'TODO: Сформировать ТЗ', tone: 'primary' },
          { id: 'pay-escrow', label: 'Оплатить эскроу', toastMessage: 'TODO: Оплатить эскроу' },
          { id: 'track', label: 'Отследить', toastMessage: 'TODO: Отследить поставку' }
        ]}
      >
        <div className="space-y-3">
          {ORDERS.map((order) => (
            <div key={order.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-neutral-100">{order.title}</p>
              <span className="text-xs text-neutral-500">{order.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="contracts"
        title="Договоры"
        description="Подписанные документы и статусы."
        actions={[{ id: 'sync-contracts', label: 'Синхронизировать', toastMessage: 'TODO: Синхронизировать договоры' }]}
      >
        <div className="space-y-3">
          {CONTRACTS.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{doc.title}</p>
              <p className="text-xs text-neutral-400">{doc.status}</p>
            </div>
          ))}
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
