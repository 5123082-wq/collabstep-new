import { ReactNode } from 'react';

const features: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'AI-помощник бренда',
    description: 'Генерация айдентики, контента и пользовательских сценариев за считанные минуты.',
    icon: '🤖'
  },
  {
    title: 'Проекты под контролем',
    description: 'Канбан, дорожные карты и автоматические отчёты о прогрессе в единой панели.',
    icon: '🧭'
  },
  {
    title: 'Маркетплейс услуг',
    description: 'Каталог проверенных специалистов и подрядчиков с рейтингами и отзывами.',
    icon: '🛒'
  },
  {
    title: 'Встроенные платежи',
    description: 'Прозрачные расчёты и гибкие тарифы для команд и агентств.',
    icon: '💳'
  }
];

export default function Features() {
  return (
    <section className="border-t border-neutral-900 bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
        <header className="mb-12 max-w-3xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">Всё для запуска продукта</h2>
          <p className="mt-4 text-neutral-400">
            Collabverse автоматизирует креативные процессы, помогает собирать команды и выводить
            продукты на рынок быстрее.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-neutral-900 bg-neutral-900/40 p-6">
              <span className="text-3xl" aria-hidden>{feature.icon}</span>
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
