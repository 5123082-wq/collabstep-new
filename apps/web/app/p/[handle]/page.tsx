export default function PublicProfilePlaceholder({ params }: { params: { handle: string } }) {
  return (
    <main data-app-main className="flex flex-col gap-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-wide text-indigo-300">Публичная визитка</p>
        <h1 className="text-3xl font-semibold text-neutral-50">@{params.handle}</h1>
      </header>
      <section className="space-y-4 rounded-3xl border border-neutral-900 bg-neutral-950/70 p-8 text-center">
        <p className="text-base text-neutral-300">
          Данные и виджеты будут подключаться на следующих этапах. Сейчас — демо-макет.
        </p>
        <p className="text-sm text-neutral-500">
          Расширенная визитка появится после запуска полноценного профиля специалистов.
        </p>
      </section>
    </main>
  );
}
