'use client';

export const dynamic = 'force-dynamic';

export default function MarketingStub() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-4">Collabverse — Stage 0</h1>
        <p className="text-neutral-300">
          Базовый каркас установлен. Включите маркетинговый слой на Этапе 1.
        </p>
      </header>
      <section className="space-y-4 text-neutral-300">
        <p>Маркетинговый сегмент пока в статусе заглушки.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Запуск: <code>pnpm install</code> → <code>pnpm dev</code>
          </li>
          <li>
            Маркетинговый layout: <code>/app/(marketing)</code> (заглушка)
          </li>
          <li>
            Флаг: <code>NAV_V1</code> в <code>.env</code> (по умолчанию off)
          </li>
        </ul>
      </section>
    </main>
  );
}
