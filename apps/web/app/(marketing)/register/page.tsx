import Link from 'next/link';
import type { Metadata } from 'next';

const roles = [
  { id: 'customer', label: 'Заказчик', description: 'Публикуйте проекты и управляйте подрядчиками.' },
  { id: 'specialist', label: 'Специалист', description: 'Откликайтесь на задачи и развивайте профиль.' },
  { id: 'contractor', label: 'Подрядчик', description: 'Подключайте команду и тарифы для клиентов.' }
];

export const metadata: Metadata = {
  title: 'Регистрация в Collabverse',
  description: 'Выберите роль и зарегистрируйтесь в Collabverse: заказчик, специалист или подрядчик.',
  openGraph: {
    title: 'Регистрация в Collabverse',
    description: 'Выберите роль и зарегистрируйтесь в Collabverse.',
    url: '/register',
    type: 'website'
  }
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold">Регистрация</h1>
        <p className="text-neutral-300">
          Выберите роль, чтобы настроить опыт в Collabverse. Регистрация бесплатна и занимает пару минут.
        </p>
      </header>
      <form className="mt-8 space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-neutral-200">Я хочу зарегистрироваться как</legend>
          {roles.map((role) => (
            <label
              key={role.id}
              htmlFor={role.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 transition hover:border-neutral-600"
            >
              <input
                type="radio"
                id={role.id}
                name="role"
                value={role.id}
                className="mt-1 h-4 w-4 border-neutral-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-semibold text-neutral-100">{role.label}</span>
                <span className="mt-1 block text-sm text-neutral-400">{role.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          Продолжить регистрацию
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">
        Уже есть аккаунт?{' '}
        <Link
          href="/login"
          className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          Войти
        </Link>
      </p>
    </main>
  );
}
