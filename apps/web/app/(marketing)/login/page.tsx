import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход в Collabverse',
  description: 'Войдите в Collabverse, чтобы управлять проектами и профилем.',
  openGraph: {
    title: 'Вход в Collabverse',
    description: 'Войдите в Collabverse, чтобы управлять проектами и профилем.',
    url: '/login',
    type: 'website'
  }
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 sm:px-8">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold">Вход</h1>
        <p className="text-neutral-300">Используйте корпоративную почту для входа в Collabverse.</p>
      </header>
      <form className="mt-8 space-y-4">
        <label className="block text-sm text-neutral-300">
          Email
          <input
            type="email"
            name="email"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
            placeholder="name@company.com"
          />
        </label>
        <label className="block text-sm text-neutral-300">
          Пароль
          <input
            type="password"
            name="password"
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-indigo-400 focus:outline-none"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          Войти
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">
        Нет аккаунта?{' '}
        <Link
          href="/register"
          className="font-semibold text-indigo-300 transition hover:text-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          Создать профиль
        </Link>
      </p>
    </main>
  );
}
