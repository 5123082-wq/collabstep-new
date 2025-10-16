import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Ошибка 404</p>
        <h1 className="text-3xl font-semibold">Страница не найдена</h1>
        <p className="text-sm text-neutral-300">
          Похоже, что запрошенный раздел недоступен или был перемещён. Проверьте адрес или воспользуйтесь ссылками ниже.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            На главную
          </Link>
          <Link
            href="/app/dashboard"
            className="rounded-full border border-neutral-700 px-5 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            К проектам
          </Link>
        </div>
      </div>
    </div>
  );
}
