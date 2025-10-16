import { ProjectSection, ProjectStatePreview } from '@/components/project/ProjectSection';

const BRAND_SYSTEM = [
  { id: 'logo', title: 'Логотип', version: 'v2.1', status: 'Готово' },
  { id: 'palette', title: 'Цветовая палитра', version: 'v1.5', status: 'В работе' },
  { id: 'typography', title: 'Типографика', version: 'v1.0', status: 'Черновик' }
];

const LAYOUTS = [
  { id: 'landing', title: 'Лендинг', status: 'На ревью' },
  { id: 'dashboard', title: 'Дашборд', status: 'В работе' },
  { id: 'mobile', title: 'Мобильные экраны', status: 'Готово' }
];

const PRINT = [
  { id: 'stickers', title: 'Стикер-пак', status: 'Финал' },
  { id: 'hoodie', title: 'Худи', status: 'В дизайне' },
  { id: 'packaging', title: 'Подарочная упаковка', status: 'Бриф' }
];

export default function ProjectDesignPage() {
  return (
    <div className="space-y-8">
      <ProjectSection
        id="brand"
        title="Бренд-система"
        description="Основные элементы айдентики и версия дизайн-системы."
        actions={[
          { id: 'lock', label: 'Заблокировать версию', toastMessage: 'TODO: Заблокировать версию', tone: 'primary' },
          { id: 'share-brand', label: 'Поделиться', toastMessage: 'TODO: Поделиться бренд-системой' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {BRAND_SYSTEM.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <p className="text-xs text-neutral-400">Версия {item.version}</p>
              <p className="mt-2 text-xs text-neutral-500">Статус: {item.status}</p>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="layouts"
        title="Макеты"
        description="UI-экраны и состояние ревью."
        actions={[
          { id: 'request-review', label: 'Запросить правки', toastMessage: 'TODO: Запросить правки' },
          { id: 'download', label: 'Скачать пакет', toastMessage: 'TODO: Скачать пакет', tone: 'primary' }
        ]}
      >
        <div className="space-y-3">
          {LAYOUTS.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <span className="text-xs text-neutral-500">{item.status}</span>
            </div>
          ))}
        </div>
      </ProjectSection>
      <ProjectSection
        id="print"
        title="Печать"
        description="Материалы для физического производства и мерча."
        actions={[
          { id: 'send-contractor', label: 'Отправить подрядчику', toastMessage: 'TODO: Отправить подрядчику', tone: 'primary' }
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {PRINT.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-900 bg-neutral-900/60 p-4">
              <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.status}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProjectStatePreview />
        </div>
      </ProjectSection>
    </div>
  );
}
