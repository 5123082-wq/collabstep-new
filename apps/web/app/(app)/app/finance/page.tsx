import { redirect } from 'next/navigation';

export default function FinanceRootPage() {
  redirect('/app/finance/expenses');
}
