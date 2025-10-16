'use client';

import ErrorFallback from '@/components/ui/ErrorFallback';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="mx-auto flex max-w-4xl flex-1 flex-col px-6 py-24">
          <ErrorFallback
            title="Что-то пошло не так"
            description="Мы уже получили отчёт об ошибке. Попробуйте ещё раз или вернитесь на главную страницу."
            reset={reset}
            links={[
              { href: '/', label: 'На главную' },
              { href: '/app/dashboard', label: 'В рабочий стол' }
            ]}
          />
        </div>
      </body>
    </html>
  );
}
