export default function EmptyTemplatesState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-800/80 bg-neutral-900/40 p-16 text-center">
      <h2 className="text-xl font-semibold text-neutral-200">Не нашли подходящий шаблон</h2>
      <p className="max-w-lg text-sm text-neutral-400">
        Попробуйте изменить запрос или снимите фильтры. Мы постоянно пополняем маркетплейс новыми шаблонами и
        проектами.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-indigo-400 px-5 py-2 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
