import Link from 'next/link';

export default function CTA() {
  return (
    <section className="border-y border-neutral-900 bg-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center sm:px-8 lg:px-12">
        <h2 className="text-2xl font-semibold sm:text-3xl">Готовы к запуску нового проекта?</h2>
        <p className="max-w-3xl text-neutral-300">
          Зарегистрируйтесь и соберите команду экспертов. Collabverse поможет с брифом, AI-подсказками
          и проверенными шаблонами.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Зарегистрироваться
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-500"
          >
            Посмотреть тарифы
          </Link>
        </div>
      </div>
    </section>
  );
}
