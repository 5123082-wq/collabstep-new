'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

type ProjectErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProjectError({ error, reset }: ProjectErrorProps) {
  const params = useParams<{ id: string }>();
  const digest = `project-${params?.id ?? 'unknown'}-${error.digest ?? 'error'}`;

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

  const projectId = params?.id ?? 'проект';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Не удалось открыть проект {projectId}</h1>
        <p className="text-sm text-neutral-300">
          Мы не смогли загрузить данные проекта. Попробуйте снова или вернитесь к списку проектов.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const storageKey = `collabverse-auto-reset-${digest}`;
                window.sessionStorage.setItem(storageKey, '1');
                const destination = `/project/${projectId}/overview`;
                window.location.href = destination;
              }
            }}
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
          >
            Повторить попытку
          </button>
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
