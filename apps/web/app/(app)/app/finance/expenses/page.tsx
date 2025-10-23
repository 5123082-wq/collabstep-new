import FinanceExpensesPageClient from './page-client';

type FinanceExpensesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

const globalExpensesEnabled = process.env.NEXT_PUBLIC_FEATURE_GLOBAL_EXPENSES !== '0';

export default function FinanceExpensesPage({ searchParams }: FinanceExpensesPageProps) {
  if (!globalExpensesEnabled) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-3xl border border-neutral-900 bg-neutral-950/70 p-10 text-center text-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-50">Глобальные расходы отключены</h1>
        <p className="text-sm text-neutral-400">
          Раздел недоступен в текущей сборке. Включите фич-флаг <code className="rounded bg-neutral-900 px-1 py-0.5">NEXT_PUBLIC_FEATURE_GLOBAL_EXPENSES</code>, чтобы работать с единой книгой расходов.
        </p>
      </div>
    );
  }
  return <FinanceExpensesPageClient searchParams={searchParams} />;
}
