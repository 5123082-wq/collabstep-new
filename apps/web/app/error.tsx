'use client';

import { useEffect } from 'react';

import Link from 'next/link';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const digest = error.digest ?? 'global';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = `collabverse-auto-reset-${digest}`;
    if (!window.sessionStorage.getItem(storageKey)) {
      window.sessionStorage.setItem(storageKey, '1');
      reset();
    }
  }, [digest, reset]);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-neutral-100">
        <div className="max-w-lg space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Что-то пошло не так</h1>
          <p className="text-sm text-neutral-300">
            Мы уже знаем о проблеме и пытаемся восстановить страницу. Попробуйте обновить страницу или вернитесь на главную.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const storageKey = `collabverse-auto-reset-${digest}`;
                  window.sessionStorage.setItem(storageKey, '1');
                }
                reset();
              }}
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              Повторить попытку
            </button>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-5 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
            >
              На главную
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
