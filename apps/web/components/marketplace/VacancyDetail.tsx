'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Vacancy } from '@/lib/schemas/marketplace-vacancy';
import { toast } from '@/lib/ui/toast';

const EMPLOYMENT_LABEL: Record<'project' | 'part-time' | 'full-time', string> = {
  project: 'Проектная занятость',
  'part-time': 'Частичная занятость',
  'full-time': 'Полная занятость'
};

const FORMAT_LABEL: Record<'remote' | 'office' | 'hybrid', string> = {
  remote: 'Удалённо',
  office: 'В офисе',
  hybrid: 'Гибрид'
};

function formatReward(reward: Vacancy['reward']): string {
  if (reward.type === 'rate') {
    const min = reward.min.toLocaleString('ru-RU');
    const max = reward.max.toLocaleString('ru-RU');
    const period = reward.period === 'hour' ? 'час' : reward.period === 'day' ? 'день' : 'проект';
    const currency = reward.currency === 'RUB' ? '₽' : reward.currency;
    if (reward.min === reward.max) {
      return `${min} ${currency}/${period}`;
    }
    return `${min} – ${max} ${currency}/${period}`;
  }
  if (reward.type === 'salary') {
    const amount = reward.amount.toLocaleString('ru-RU');
    const currency = reward.currency === 'RUB' ? '₽' : reward.currency;
    return `${amount} ${currency}/мес.`;
  }
  return `Доля ${reward.share}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

type VacancyDetailProps = {
  vacancy: Vacancy;
};

export default function VacancyDetail({ vacancy }: VacancyDetailProps) {
  const [isRespondOpen, setRespondOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const detailSections = useMemo(
    () => [
      { id: 'requirements', title: 'Требования', items: vacancy.requirements },
      { id: 'responsibilities', title: 'Задачи', items: vacancy.responsibilities }
    ],
    [vacancy.requirements, vacancy.responsibilities]
  );

  useEffect(() => {
    if (!isRespondOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setRespondOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isRespondOpen]);

  useEffect(() => {
    if (!isRespondOpen) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const firstInput = formRef.current?.querySelector('input, textarea') as HTMLElement | null;
    firstInput?.focus();

    const dialogNode = dialogRef.current;
    if (!dialogNode) {
      return;
    }

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = Array.from(
        dialogNode.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('aria-hidden'));

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialogNode.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialogNode.addEventListener('keydown', handleTab);
    return () => dialogNode.removeEventListener('keydown', handleTab);
  }, [isRespondOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name')?.toString().trim();
    if (!name) {
      toast('Введите имя, чтобы отправить отклик', 'warning');
      return;
    }
    toast('Отклик отправлен', 'success');
    setRespondOpen(false);
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/app/marketplace/vacancies"
            className="inline-flex items-center gap-2 text-sm text-indigo-200 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            ← Назад в каталог
          </Link>
          <p className="mt-4 text-xs uppercase tracking-wide text-indigo-300">{vacancy.project}</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-50">{vacancy.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
          <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">{vacancy.level}</span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">{EMPLOYMENT_LABEL[vacancy.employment]}</span>
          {vacancy.format.map((format) => (
            <span key={format} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">
              {FORMAT_LABEL[format]}
            </span>
          ))}
          <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">Язык: {vacancy.language.toUpperCase()}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
            <h2 className="text-lg font-semibold text-neutral-100">Описание</h2>
            <p className="mt-3 text-sm text-neutral-300">{vacancy.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
              {vacancy.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {detailSections.map((section) => (
            <section key={section.id} className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
              <h2 className="text-lg font-semibold text-neutral-100">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-1 block h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
            <h2 className="text-lg font-semibold text-neutral-100">Тестовое задание</h2>
            <p className="mt-3 text-sm text-neutral-300">{vacancy.testTask}</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6">
            <h2 className="text-base font-semibold text-neutral-100">Условия</h2>
            <dl className="mt-3 space-y-2 text-sm text-neutral-300">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Вознаграждение</dt>
                <dd className="text-right text-neutral-100">{formatReward(vacancy.reward)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Дедлайн</dt>
                <dd className="text-right">{formatDate(vacancy.deadline)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-400">Публикация</dt>
                <dd className="text-right">{formatDate(vacancy.createdAt)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-neutral-500">{vacancy.paymentNote}</p>
          </section>

          <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 space-y-3">
            <h2 className="text-base font-semibold text-neutral-100">Контакты</h2>
            <p className="text-sm text-neutral-300">{vacancy.contact.name}</p>
            <p className="text-sm text-neutral-400">{vacancy.contact.channel}</p>
            <button
              type="button"
              onClick={() => toast('Чат откроется позже (mock)')}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Открыть чат
            </button>
          </section>

          <section className="rounded-3xl border border-neutral-900 bg-neutral-950/60 p-6 space-y-3">
            <button
              type="button"
              onClick={() => setRespondOpen(true)}
              className="w-full rounded-xl border border-indigo-500/50 bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Откликнуться
            </button>
            <button
              type="button"
              onClick={() => toast('Вакансия сохранена (mock)')}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Сохранить вакансию
            </button>
            <button
              type="button"
              onClick={() => toast('Подписка оформлена (mock)')}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              Подписаться на обновления
            </button>
          </section>
        </aside>
      </div>

      {isRespondOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Отклик на вакансию"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur"
        >
          <div className="w-full rounded-3xl border border-neutral-900 bg-neutral-950/90 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">Отклик на вакансию</h2>
                <p className="text-sm text-neutral-400">Расскажите о себе и оставьте контакты — команда свяжется с вами.</p>
              </div>
              <button
                type="button"
                onClick={() => setRespondOpen(false)}
                className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-sm text-neutral-300 transition hover:border-rose-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                aria-label="Закрыть форму"
              >
                Esc
              </button>
            </div>
            <form ref={formRef} className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-neutral-300">
                <span>Имя</span>
                <input
                  name="name"
                  type="text"
                  required
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-neutral-300">
                <span>Контакты (email или мессенджер)</span>
                <input
                  name="contacts"
                  type="text"
                  required
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-neutral-300">
                <span>Комментарий</span>
                <textarea
                  name="comment"
                  rows={3}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
                  placeholder="Например, чем заинтересовал проект"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-neutral-300">
                <span>Ссылки на портфолио</span>
                <textarea
                  name="links"
                  rows={2}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
                  placeholder="Behance, GitHub или другой ресурс"
                />
              </label>
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondOpen(false)}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-indigo-500/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  Отправить отклик
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
