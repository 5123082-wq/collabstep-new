'use client';

import { useState } from 'react';

const templates = [
  { value: 'brand', label: 'Бренд' },
  { value: 'landing', label: 'Лендинг' },
  { value: 'marketing', label: 'Маркетинговая кампания' },
  { value: 'product', label: 'Digital-продукт' },
  { value: 'custom', label: 'Пустой' }
] as const;

type TemplateValue = (typeof templates)[number]['value'];

export default function ProjectNewPageClient() {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<TemplateValue>('custom');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, stage: 'discovery', template })
      });

      if (!response.ok) {
        throw new Error('Не удалось создать проект');
      }

      const project = (await response.json()) as { id: string };
      window.location.href = `/project/${project.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Проекты</p>
        <h1 className="text-3xl font-semibold text-white">Новый проект</h1>
        <p className="text-sm text-neutral-400">
          Запустите новую рабочую сессию и выберите подходящий шаблон, чтобы ускориться с первых шагов.
        </p>
      </header>
      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Название</span>
          <input
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Например: Запуск маркетинговой кампании"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Шаблон</span>
          <select
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            value={template}
            onChange={(event) => setTemplate(event.target.value as TemplateValue)}
          >
            {templates.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Создание…' : 'Создать проект'}
      </button>
    </div>
  );
}
