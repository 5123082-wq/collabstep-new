'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectStage } from '@/domain/projects/types';
import { toast } from '@/lib/ui/toast';

type CreationStep = 0 | 1 | 2;
type CreationMode = 'blank' | 'template';

type TemplateOption = {
  id: string;
  title: string;
  kind: string;
  summary: string;
};

const STAGE_OPTIONS: { value: ProjectStage; label: string }[] = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'design', label: 'Дизайн' },
  { value: 'build', label: 'Разработка' },
  { value: 'launch', label: 'Запуск' },
  { value: 'support', label: 'Сопровождение' }
];

const MODE_OPTIONS: { id: CreationMode; title: string; description: string }[] = [
  {
    id: 'blank',
    title: 'Пустой проект',
    description: 'Создать проект с чистого листа и настроить всё вручную.'
  },
  {
    id: 'template',
    title: 'Из шаблона',
    description: 'Выбрать готовый сценарий и стартовать с преподготовленной структурой.'
  }
];

const STEP_TITLES = ['Выберите способ запуска', 'Заполните основные данные', 'Соберите команду'];

const TEMPLATE_KIND_LABELS: Record<string, string> = {
  brand: 'Бренд',
  landing: 'Лендинг',
  marketing: 'Маркетинг',
  product: 'Продукт'
};

export default function ProjectNewPageClient() {
  const router = useRouter();
  const [step, setStep] = useState<CreationStep>(0);
  const [mode, setMode] = useState<CreationMode>('blank');
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<ProjectStage>('discovery');
  const [deadline, setDeadline] = useState('');
  const [teamLead, setTeamLead] = useState('Я (владелец проекта)');
  const [inviteInput, setInviteInput] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== 'template') {
      return;
    }
    if (templates.length > 0 || templatesLoading) {
      return;
    }
    const controller = new AbortController();
    setTemplatesLoading(true);
    setTemplatesError(null);
    fetch('/api/templates', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить шаблоны');
        }
        const payload = (await response.json()) as { items?: unknown };
        const rawItems = Array.isArray(payload.items) ? payload.items : [];
        const normalized: TemplateOption[] = [];
        for (const item of rawItems) {
          if (!item || typeof item !== 'object') {
            continue;
          }
          const record = item as Record<string, unknown>;
          const id = typeof record.id === 'string' ? record.id : null;
          const kind = typeof record.kind === 'string' ? record.kind : null;
          const templateTitle = typeof record.title === 'string' ? record.title : null;
          const summary = typeof record.summary === 'string' ? record.summary : '';
          if (id && kind && templateTitle) {
            normalized.push({ id, kind, title: templateTitle, summary });
          }
        }
        setTemplates(normalized);
        if (normalized.length > 0 && !selectedTemplate) {
          setSelectedTemplate(normalized[0]?.id ?? '');
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error(err);
        setTemplatesError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      })
      .finally(() => {
        setTemplatesLoading(false);
      });

    return () => controller.abort();
  }, [mode, selectedTemplate, templates.length, templatesLoading]);

  useEffect(() => {
    if (mode !== 'template') {
      setSelectedTemplate('');
      return;
    }
    if (!selectedTemplate) {
      return;
    }
    const template = templates.find((item) => item.id === selectedTemplate);
    if (template && !title) {
      setTitle(template.title);
    }
  }, [mode, selectedTemplate, templates, title]);

  const stepTitle = useMemo(() => STEP_TITLES[step] ?? STEP_TITLES[0], [step]);

  const handleClose = useCallback(() => {
    router.push('/project');
  }, [router]);

  const handleNext = useCallback(() => {
    setError(null);
    if (step === 0 && mode === 'template' && !selectedTemplate) {
      setError('Выберите шаблон, чтобы продолжить');
      return;
    }
    if (step === 1 && !title.trim()) {
      setError('Введите название проекта');
      return;
    }
    setStep((prev) => (prev < 2 ? ((prev + 1) as CreationStep) : prev));
  }, [mode, selectedTemplate, step, title]);

  const handleBack = useCallback(() => {
    setError(null);
    setStep((prev) => (prev > 0 ? ((prev - 1) as CreationStep) : prev));
  }, []);

  const handleAddInvite = useCallback(() => {
    const trimmed = inviteInput.trim();
    if (!trimmed) {
      return;
    }
    const exists = invites.some((item) => item.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setInviteInput('');
      return;
    }
    setInvites((current) => [...current, trimmed]);
    setInviteInput('');
  }, [inviteInput, invites]);

  const handleRemoveInvite = useCallback((email: string) => {
    setInvites((current) => current.filter((item) => item !== email));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    if (!title.trim()) {
      setError('Введите название проекта');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          stage,
          deadline: deadline || undefined,
          templateId: mode === 'template' && selectedTemplate ? selectedTemplate : undefined
        })
      });
      if (!response.ok) {
        throw new Error('Не удалось создать проект');
      }
      const payload = (await response.json()) as { id?: string };
      const projectId = typeof payload.id === 'string' ? payload.id : null;
      toast('Проект создан и готов к запуску', 'success');
      if (invites.length > 0) {
        toast('Приглашения отправим команде после запуска проекта', 'info');
      }
      if (projectId) {
        router.replace(`/project/${projectId}`);
      } else {
        router.replace('/project');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      toast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  }, [deadline, description, invites.length, isSubmitting, mode, router, selectedTemplate, stage, title]);

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {MODE_OPTIONS.map((option) => {
              const active = mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setMode(option.id);
                    setError(null);
                  }}
                  className={`rounded-2xl border px-5 py-6 text-left transition ${
                    active
                      ? 'border-indigo-400 bg-indigo-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950/80 text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <h3 className="text-lg font-semibold">{option.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{option.description}</p>
                </button>
              );
            })}
          </div>
          {mode === 'template' ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <h4 className="text-sm font-semibold text-white">Выберите шаблон</h4>
              {templatesLoading ? (
                <p className="mt-2 text-sm text-neutral-400">Загружаем каталог…</p>
              ) : templatesError ? (
                <p className="mt-2 text-sm text-red-400">{templatesError}</p>
              ) : templates.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">Шаблоны пока не добавлены.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {templates.map((template) => {
                    const active = selectedTemplate === template.id;
                    return (
                      <li key={template.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setError(null);
                          }}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? 'border-indigo-400 bg-indigo-500/10 text-white'
                              : 'border-neutral-800 bg-neutral-950/70 text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{template.title}</span>
                            <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400">
                              {TEMPLATE_KIND_LABELS[template.kind] ?? template.kind}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-400">{template.summary}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : null}
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Название</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: Запуск маркетинговой кампании"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Описание</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Опишите цель, ожидания и первые шаги команды"
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Стадия</span>
              <select
                value={stage}
                onChange={(event) => setStage(event.target.value as ProjectStage)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                {STAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Дедлайн</span>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
            </label>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Руководитель проекта</span>
          <input
            value={teamLead}
            onChange={(event) => setTeamLead(event.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
          />
        </label>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4">
          <h4 className="text-sm font-semibold text-white">Приглашения</h4>
          <p className="mt-1 text-xs text-neutral-500">Добавьте e-mail или имена коллег, чтобы отправить приглашение после запуска.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddInvite();
                }
              }}
              placeholder="team@company.ru"
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddInvite}
              className="inline-flex items-center justify-center rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:text-indigo-100"
            >
              Добавить
            </button>
          </div>
          {invites.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {invites.map((email) => (
                <li key={email} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-200">
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveInvite(email)}
                    className="text-neutral-500 transition hover:text-red-400"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-400">
          После создания проекта мы отправим приглашения всем указанным участникам. Они появятся в разделе «Команда».
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-neutral-950/90 px-4 py-10 backdrop-blur">
      <div className="flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-neutral-900 bg-neutral-950/95 p-6 shadow-xl">
        <header className="flex flex-col gap-4 border-b border-neutral-900 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Новый проект</p>
            <h1 className="text-2xl font-semibold text-white">{stepTitle}</h1>
            <p className="text-sm text-neutral-400">Шаг {step + 1} из 3</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="self-start rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-400 transition hover:border-neutral-700 hover:text-white"
          >
            Закрыть
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">{renderStepContent()}</div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <footer className="flex flex-col gap-3 border-t border-neutral-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            {step === 2 ? 'Проверьте данные и запустите проект' : 'Заполните шаг и продолжите'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={step === 0 ? handleClose : handleBack}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-700 hover:text-white"
              disabled={isSubmitting}
            >
              {step === 0 ? 'Отмена' : 'Назад'}
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создаём…' : 'Создать проект'}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
