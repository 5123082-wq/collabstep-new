'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { ZodIssue } from 'zod';
import { getUserRoles, type UserRole } from '@/lib/auth/roles';
import {
  WizardDetailsSchema,
  WizardSelectionSchema,
  WizardTeamSchema,
  createInitialWizardDraft,
  projectStageOptions,
  type WizardDetails,
  type WizardDraft,
  type WizardSelection,
  type WizardTeam
} from '@/lib/project/create-wizard-schemas';
import { clearWizardDraft, readWizardDraft, writeWizardDraft } from '@/lib/project/create-wizard-storage';
import { useProjectDocsIntegration } from '@/lib/project/docs-integration';
import { toast } from '@/lib/ui/toast';

const STEP_CONFIG = [
  { id: 0, title: 'Сценарий запуска', description: 'Выберите пустой проект или шаблон' },
  { id: 1, title: 'Детали проекта', description: 'Заполните основные поля и финансовые параметры' },
  { id: 2, title: 'Команда и приглашения', description: 'Подготовьте команду и поделитесь доступом' }
] as const;

type TemplateOption = {
  id: string;
  title: string;
  summary: string;
  kind: string;
};

type FetchState = 'idle' | 'loading' | 'error' | 'success';

type PaymentValue = Exclude<WizardDetails['finance']['paymentType'], null>;

const PAYMENT_OPTIONS: { value: PaymentValue; label: string }[] = [
  { value: 'fixed', label: 'Фиксированная стоимость' },
  { value: 'time-and-materials', label: 'Time & Materials' },
  { value: 'retainer', label: 'Ретейнер' }
];

const INVITE_ALLOWED_ROLES = new Set<UserRole>(['FOUNDER', 'PM', 'ADMIN']);

function hasMeaningfulDraft(draft: WizardDraft): boolean {
  if (draft.selection.mode === 'template' && draft.selection.templateId) {
    return true;
  }
  if (draft.details.name.trim().length > 0) {
    return true;
  }
  if (draft.details.tags.length > 0) {
    return true;
  }
  if (draft.team.invites.length > 0) {
    return true;
  }
  return false;
}

function findIssueMessage(issues: ZodIssue[], path: string): string | null {
  for (const issue of issues) {
    const joined = issue.path.join('.');
    if (joined === path || issue.path[0] === path) {
      return issue.message;
    }
  }
  return null;
}

function buildInviteLink(details: WizardDetails): string {
  if (typeof window === 'undefined') {
    return 'https://collabverse.test/join/project';
  }
  const origin = window.location.origin;
  const slug = details.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project';
  return `${origin}/join/${slug}`;
}

export default function ProjectCreateWizardPageClient() {
  const initialDraftRef = useRef<WizardDraft | null>(null);
  if (initialDraftRef.current === null) {
    initialDraftRef.current = readWizardDraft();
  }
  const appliedTemplateDefaults = useRef<Set<string>>(new Set());

  const [draft, setDraft] = useState<WizardDraft>(() => initialDraftRef.current ?? createInitialWizardDraft());
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [templateFetchState, setTemplateFetchState] = useState<FetchState>('idle');
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const [inviteLink, setInviteLink] = useState(() => buildInviteLink(draft.details));
  const [restorationNotified, setRestorationNotified] = useState(() => !hasMeaningfulDraft(draft));

  const router = useRouter();
  const roles = useMemo(() => getUserRoles(), []);
  const docsIntegration = useProjectDocsIntegration();

  const step = draft.step ?? 0;
  // [PLAN:S3-machine] Derived step index drives wizard navigation.
  const canInvite = roles.some((role) => INVITE_ALLOWED_ROLES.has(role));

  // [PLAN:S3-storage] Persist draft on change.
  useEffect(() => {
    writeWizardDraft(draft);
    setLastSavedAt(new Date());
    setInviteLink(buildInviteLink(draft.details));
  }, [draft]);

  useEffect(() => {
    if (!restorationNotified && hasMeaningfulDraft(initialDraftRef.current ?? draft)) {
      toast('Черновик мастера восстановлен из предыдущей сессии', 'info');
      setRestorationNotified(true);
    }
  }, [draft, restorationNotified]);

  useEffect(() => {
    if (draft.selection.mode !== 'template') {
      return;
    }
    if (templateFetchState === 'loading' || templateFetchState === 'success') {
      return;
    }

    setTemplateFetchState('loading');
    setTemplatesError(null);

    const controller = new AbortController();
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
          const entry = item as Record<string, unknown>;
          const id = typeof entry.id === 'string' ? entry.id : null;
          const title = typeof entry.title === 'string' ? entry.title : null;
          const summary = typeof entry.summary === 'string' ? entry.summary : '';
          const kind = typeof entry.kind === 'string' ? entry.kind : 'other';
          if (id && title) {
            normalized.push({ id, title, summary, kind });
          }
        }
        setTemplates(normalized);
        setTemplateFetchState('success');
        if (normalized.length > 0) {
          setDraft((prev) => {
            if (prev.selection.mode !== 'template') {
              return prev;
            }
            const currentId = prev.selection.templateId;
            if (currentId && normalized.some((item) => item.id === currentId)) {
              return prev;
            }
            return {
              ...prev,
              selection: {
                ...prev.selection,
                templateId: normalized[0]?.id ?? null
              }
            };
          });
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error(error);
        setTemplatesError(error instanceof Error ? error.message : 'Неизвестная ошибка');
        setTemplateFetchState('error');
      });

    return () => controller.abort();
  }, [draft.selection.mode, templateFetchState]);

  useEffect(() => {
    if (draft.selection.mode !== 'template') {
      return;
    }
    const templateId = draft.selection.templateId;
    if (!templateId) {
      return;
    }
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }
    if (appliedTemplateDefaults.current.has(template.id)) {
      return;
    }
    const shouldUpdateName = draft.details.name.trim().length === 0;
    const shouldUpdateDescription = !draft.details.description || draft.details.description.trim().length === 0;
    if (!shouldUpdateName && !shouldUpdateDescription) {
      appliedTemplateDefaults.current.add(template.id);
      return;
    }
    setDraft((prev) => {
      if (prev.selection.mode !== 'template' || prev.selection.templateId !== template.id) {
        return prev;
      }
      const nextDetails: WizardDetails = {
        ...prev.details,
        name: shouldUpdateName ? template.title : prev.details.name,
        description: shouldUpdateDescription ? template.summary : prev.details.description
      };
      appliedTemplateDefaults.current.add(template.id);
      return {
        ...prev,
        details: nextDetails
      };
    });
  }, [draft.details.description, draft.details.name, draft.selection.mode, draft.selection.templateId, templates]);

  const selectionValidation = useMemo(
    () => WizardSelectionSchema.safeParse(draft.selection),
    [draft.selection]
  );
  const detailsValidation = useMemo(
    () => WizardDetailsSchema.safeParse(draft.details),
    [draft.details]
  );
  const teamValidation = useMemo(() => WizardTeamSchema.safeParse(draft.team), [draft.team]);

  const currentStepError = useMemo(() => {
    if (step === 0 && !selectionValidation.success) {
      return selectionValidation.error.issues[0]?.message ?? 'Проверьте выбор сценария';
    }
    if (step === 1 && !detailsValidation.success) {
      return detailsValidation.error.issues[0]?.message ?? 'Проверьте заполнение формы';
    }
    if (step === 2 && !teamValidation.success) {
      return teamValidation.error.issues[0]?.message ?? 'Проверьте список приглашений';
    }
    return null;
  }, [detailsValidation, selectionValidation, step, teamValidation]);

  const handleModeChange = useCallback((mode: WizardSelection['mode']) => {
    setDraft((prev) => ({
      ...prev,
      selection: {
        mode,
        templateId: mode === 'template' ? prev.selection.templateId : null
      }
    }));
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setDraft((prev) => ({
      ...prev,
      selection: {
        ...prev.selection,
        templateId
      }
    }));
  }, []);

  const handleDetailsChange = useCallback(<K extends keyof WizardDetails>(key: K, value: WizardDetails[K]) => {
    setDraft((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
  }, []);

  const handleFinanceChange = useCallback(<K extends keyof WizardDetails['finance']>(
    key: K,
    value: WizardDetails['finance'][K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        finance: {
          ...prev.details.finance,
          [key]: value
        }
      }
    }));
  }, []);

  const handleAddTag = useCallback(() => {
    const normalized = tagInput.trim().replace(/\s+/g, '-').toLowerCase();
    if (!normalized) {
      return;
    }
    setDraft((prev) => {
      if (prev.details.tags.includes(normalized)) {
        return prev;
      }
      if (prev.details.tags.length >= 8) {
        toast('Можно добавить не более 8 меток', 'warning');
        return prev;
      }
      return {
        ...prev,
        details: {
          ...prev.details,
          tags: [...prev.details.tags, normalized]
        }
      };
    });
    setTagInput('');
  }, [tagInput]);

  const handleRemoveTag = useCallback((tag: string) => {
    setDraft((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        tags: prev.details.tags.filter((item) => item !== tag)
      }
    }));
  }, []);

  const handleAddInvite = useCallback(() => {
    const normalized = inviteInput.trim().toLowerCase();
    if (!normalized) {
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setTeamError('Введите корректный e-mail');
      return;
    }
    setDraft((prev) => {
      if (prev.team.invites.includes(normalized)) {
        return prev;
      }
      if (prev.team.invites.length >= 12) {
        setTeamError('Максимум 12 приглашений за раз');
        return prev;
      }
      setTeamError(null);
      return {
        ...prev,
        team: {
          ...prev.team,
          invites: [...prev.team.invites, normalized]
        }
      };
    });
    setInviteInput('');
  }, [inviteInput]);

  const handleRemoveInvite = useCallback((email: string) => {
    setDraft((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        invites: prev.team.invites.filter((item) => item !== email)
      }
    }));
  }, []);

  const handleTeamChange = useCallback(<K extends keyof WizardTeam>(key: K, value: WizardTeam[K]) => {
    setDraft((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        [key]: value
      }
    }));
  }, []);

  const goToStep = useCallback(
    (target: number) => {
      setDraft((prev) => ({
        ...prev,
        step: Math.min(Math.max(target, 0), STEP_CONFIG.length - 1)
      }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (step === 0 && !selectionValidation.success) {
      return;
    }
    if (step === 1 && !detailsValidation.success) {
      return;
    }
    if (step === 2 && !teamValidation.success) {
      return;
    }
    goToStep(step + 1);
  }, [detailsValidation.success, goToStep, selectionValidation.success, step, teamValidation.success]);

  const handlePrev = useCallback(() => {
    goToStep(step - 1);
  }, [goToStep, step]);

  const handleResetDraft = useCallback(() => {
    clearWizardDraft();
    const fresh = createInitialWizardDraft();
    initialDraftRef.current = fresh;
    setDraft(fresh);
    setTagInput('');
    setInviteInput('');
    setTeamError(null);
    setTemplatesError(null);
    setTemplateFetchState('idle');
    appliedTemplateDefaults.current.clear();
    toast('Черновик мастера очищен', 'info');
  }, []);

  const handleOpenDocuments = useCallback(() => {
    docsIntegration(draft.selection);
  }, [docsIntegration, draft.selection]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyState('success');
      toast('Ссылка скопирована', 'success');
      setTimeout(() => setCopyState('idle'), 2500);
    } catch (error) {
      console.warn('Clipboard error', error);
      setCopyState('error');
      toast('Не удалось скопировать ссылку', 'warning');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }, [inviteLink]);

  const handleCancel = useCallback(() => {
    router.push('/app/projects');
  }, [router]);

  // [PLAN:S3-submit] Submit handler triggers API calls and redirect.
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    if (!detailsValidation.success) {
      toast('Заполните обязательные поля перед запуском', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let projectId: string | null = null;
      if (draft.selection.mode === 'template' && draft.selection.templateId) {
        const response = await fetch('/api/projects/from-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: draft.selection.templateId,
            title: draft.details.name.trim()
          })
        });
        if (!response.ok) {
          throw new Error('Не удалось создать проект из шаблона');
        }
        const payload = (await response.json()) as { id?: string };
        projectId = typeof payload.id === 'string' ? payload.id : null;
      } else {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: draft.details.name.trim(),
            description: draft.details.description ?? '',
            stage: draft.details.stage,
            deadline: draft.details.deadline ?? undefined
          })
        });
        if (!response.ok) {
          throw new Error('Не удалось создать проект');
        }
        const payload = (await response.json()) as { id?: string };
        projectId = typeof payload.id === 'string' ? payload.id : null;
      }

      clearWizardDraft();
      setDraft(createInitialWizardDraft());
      appliedTemplateDefaults.current.clear();
      toast('Проект создан и запущен', 'success');
      if (draft.team.invites.length > 0) {
        toast(`Приглашения подготовлены: ${draft.team.invites.length} шт.`, 'info');
      }
      docsIntegration(draft.selection);
      if (projectId) {
        router.replace(`/app/project/${projectId}`);
      } else {
        router.replace('/app/projects');
      }
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast(message, 'warning');
    } finally {
      setSubmitting(false);
    }
  }, [detailsValidation.success, draft, docsIntegration, isSubmitting, router]);

  const renderStepContent = () => {
    // [PLAN:S3-step1] Scenario selection with template loading states.
    if (step === 0) {
      const templateIssues = selectionValidation.success ? [] : selectionValidation.error.issues;
      const templateErrorMessage = templatesError ?? findIssueMessage(templateIssues, 'templateId');

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                id: 'blank' as const,
                title: 'Пустой проект',
                description: 'Начните с чистого листа и настройте структуру под свои процессы.'
              },
              {
                id: 'template' as const,
                title: 'Использовать шаблон',
                description: 'Выберите готовый сценарий с преподготовленными задачами и артефактами.'
              }
            ].map((option) => {
              const active = draft.selection.mode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleModeChange(option.id)}
                  data-testid={`wizard-mode-${option.id}`}
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
          {draft.selection.mode === 'template' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-200">★</div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Каталог шаблонов</h4>
                  <p className="text-xs text-neutral-400">Выберите подходящий сценарий. Можно изменить позже.</p>
                </div>
              </div>
              {templateFetchState === 'loading' ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="h-24 animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/60"
                    />
                  ))}
                </div>
              ) : templateFetchState === 'error' ? (
                <p className="text-sm text-red-400">{templateErrorMessage ?? 'Не удалось загрузить шаблоны'}</p>
              ) : templates.length === 0 ? (
                <p className="text-sm text-neutral-400">Шаблоны пока не добавлены. Можно продолжить с пустым проектом.</p>
              ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                  {templates.map((template) => {
                    const active = draft.selection.templateId === template.id;
                    return (
                      <li key={template.id}>
                        <button
                          type="button"
                          onClick={() => handleTemplateSelect(template.id)}
                          data-testid={`wizard-template-${template.id}`}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? 'border-indigo-400 bg-indigo-500/10 text-white'
                              : 'border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold">{template.title}</span>
                            <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs uppercase text-neutral-400">
                              {template.kind}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-neutral-400">{template.summary}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {templateErrorMessage ? (
                <p className="text-xs text-red-400">{templateErrorMessage}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    }

    // [PLAN:S3-step2] Core project details with validation feedback.
    if (step === 1) {
      const issues = detailsValidation.success ? [] : detailsValidation.error.issues;
      const nameError = findIssueMessage(issues, 'name');
      const deadlineError = findIssueMessage(issues, 'deadline');
      const budgetError = findIssueMessage(issues, 'finance.budget');
      const currencyError = findIssueMessage(issues, 'finance.currency');
      const tagsError = issues.find((issue) => issue.path[0] === 'tags')?.message ?? null;

      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Название проекта</span>
              <input
                value={draft.details.name}
                onChange={(event) => handleDetailsChange('name', event.target.value)}
                placeholder="Например: Запуск маркетинговой кампании"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
              {nameError ? <p className="text-xs text-red-400">{nameError}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Статус приватности</span>
              <div className="flex gap-3">
                {(
                  [
                    { value: 'private' as const, label: 'Приватный' },
                    { value: 'public' as const, label: 'Публичный' }
                  ] satisfies { value: WizardDetails['visibility']; label: string }[]
                ).map((option) => {
                  const active = draft.details.visibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDetailsChange('visibility', option.value)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm transition ${
                        active
                          ? 'border-indigo-400 bg-indigo-500/10 text-white'
                          : 'border-neutral-800 bg-neutral-950/80 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Описание</span>
            <textarea
              value={draft.details.description ?? ''}
              onChange={(event) => handleDetailsChange('description', event.target.value || null)}
              rows={4}
              placeholder="Опишите цель, ожидания и первые шаги команды"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Стадия</span>
              <select
                value={draft.details.stage}
                onChange={(event) => handleDetailsChange('stage', event.target.value as WizardDetails['stage'])}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                {projectStageOptions.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Дедлайн</span>
              <input
                type="date"
                value={draft.details.deadline ?? ''}
                onChange={(event) => handleDetailsChange('deadline', event.target.value ? event.target.value : null)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
              {deadlineError ? <p className="text-xs text-red-400">{deadlineError}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Модель оплаты</span>
              <select
                value={draft.details.finance.paymentType ?? 'fixed'}
                onChange={(event) => handleFinanceChange('paymentType', event.target.value as PaymentValue)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Планируемый бюджет</span>
              <input
                inputMode="decimal"
                value={draft.details.finance.budget ?? ''}
                onChange={(event) => handleFinanceChange('budget', event.target.value ? event.target.value : null)}
                placeholder="Например: 250000"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
              {budgetError ? <p className="text-xs text-red-400">{budgetError}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">Валюта</span>
              <input
                value={draft.details.finance.currency ?? ''}
                onChange={(event) =>
                  handleFinanceChange('currency', event.target.value ? event.target.value.toUpperCase() : null)
                }
                maxLength={3}
                placeholder="RUB"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm uppercase text-white focus:border-indigo-400 focus:outline-none"
              />
              {currencyError ? <p className="text-xs text-red-400">{currencyError}</p> : null}
            </label>
          </div>
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wide text-neutral-500">Метки</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="marketing, launch, q1"
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:text-indigo-100"
              >
                Добавить метку
              </button>
            </div>
            {tagsError ? <p className="text-xs text-red-400">{tagsError}</p> : null}
            {draft.details.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {draft.details.tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neutral-500 transition hover:text-red-400"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500">Используйте метки, чтобы группировать проекты и задачи.</p>
            )}
          </div>
        </div>
      );
    }

    // [PLAN:S3-step3] Team invitations and invite link management.
    const inviteIssues = teamValidation.success ? [] : teamValidation.error.issues;
    const inviteMessageError = findIssueMessage(inviteIssues, 'inviteMessage');

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-base font-semibold text-indigo-200">👥</div>
          <div>
            <h3 className="text-lg font-semibold text-white">Команда проекта</h3>
            <p className="text-sm text-neutral-400">Пригласите участников или скопируйте ссылку для быстрого доступа.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddInvite();
                }
              }}
              disabled={!canInvite}
              placeholder="team@company.ru"
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleAddInvite}
              disabled={!canInvite}
              className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:text-indigo-100 disabled:opacity-60"
            >
              Добавить
            </button>
          </div>
          {teamError ? <p className="mt-2 text-xs text-red-400">{teamError}</p> : null}
          {!canInvite ? (
            <p className="mt-2 text-xs text-neutral-500">У вас нет прав на отправку приглашений. Обратитесь к владельцу рабочего пространства.</p>
          ) : null}
          {draft.team.invites.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {draft.team.invites.map((email) => (
                <li
                  key={email}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-200"
                >
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
          ) : (
            <p className="mt-3 text-xs text-neutral-500">Список приглашений пуст. Можно пропустить этот шаг и добавить команду позже.</p>
          )}
        </div>
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Общая ссылка для приглашения</p>
              <p className="text-xs text-neutral-500">Поделитесь ссылкой с партнёрами или подрядчиками.</p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                copyState === 'success'
                  ? 'border-green-400/60 text-green-200'
                  : copyState === 'error'
                  ? 'border-red-400/60 text-red-200'
                  : 'border-indigo-500/40 text-indigo-200 hover:border-indigo-400 hover:text-indigo-100'
              }`}
            >
              {copyState === 'success' ? 'Ссылка скопирована' : copyState === 'error' ? 'Ошибка копирования' : 'Скопировать ссылку'}
            </button>
          </div>
          <code className="mt-3 block truncate rounded-xl bg-neutral-900/80 px-4 py-2 text-xs text-neutral-300">
            {inviteLink}
          </code>
          <label className="mt-4 flex items-center gap-3 text-sm text-neutral-200">
            <input
              type="checkbox"
              checked={draft.team.inviteLinkEnabled}
              onChange={(event) => handleTeamChange('inviteLinkEnabled', event.target.checked)}
              className="h-4 w-4 rounded border border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-2 focus:ring-indigo-400"
            />
            Разрешить регистрацию по ссылке
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Сообщение приглашения</span>
          <textarea
            value={draft.team.inviteMessage ?? ''}
            onChange={(event) => handleTeamChange('inviteMessage', event.target.value ? event.target.value : null)}
            rows={4}
            placeholder="Добавьте приветствие или контекст для команды"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
          />
          {inviteMessageError ? <p className="text-xs text-red-400">{inviteMessageError}</p> : null}
        </label>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-5 text-sm text-neutral-300">
          <p className="font-semibold text-white">Следующие шаги</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-400">
            <li>После запуска мы отправим приглашения всем добавленным участникам.</li>
            <li>Ссылку можно отключить в настройках проекта.</li>
            <li>Документы проекта доступны в правой панели «Документы».</li>
          </ul>
          <button
            type="button"
            onClick={handleOpenDocuments}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:border-indigo-400 hover:text-indigo-100"
          >
            <span aria-hidden="true">✦</span> Подготовить документы
          </button>
        </div>
      </div>
    );
  };

  const isNextDisabled =
    step === 0 ? !selectionValidation.success : step === 1 ? !detailsValidation.success : !teamValidation.success;

  return (
    <div className="min-h-[100dvh] bg-neutral-950/95 px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-neutral-900 bg-neutral-950/98 p-8 shadow-2xl">
        <header className="space-y-6 border-b border-neutral-900 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Мастер проекта</p>
              <h1 className="text-3xl font-semibold text-white">{STEP_CONFIG[step]?.title ?? 'Мастер проекта'}</h1>
              <p className="text-sm text-neutral-400">{STEP_CONFIG[step]?.description}</p>
            </div>
            <div className="text-xs text-neutral-500">
              {lastSavedAt ? `Черновик сохранён ${lastSavedAt.toLocaleTimeString()}` : 'Черновик сохранится автоматически'}
            </div>
          </div>
          <ol className="grid gap-2 md:grid-cols-3">
            {STEP_CONFIG.map((item, index) => {
              const completed = index < step;
              const active = index === step;
              return (
                <li
                  key={item.id}
                  className={`rounded-2xl border px-4 py-3 text-xs transition ${
                    active
                      ? 'border-indigo-500/60 bg-indigo-500/10 text-white'
                      : completed
                      ? 'border-neutral-700 bg-neutral-900/80 text-neutral-300'
                      : 'border-neutral-900 bg-neutral-950/80 text-neutral-500'
                  }`}
                >
                  <p className="font-semibold">Шаг {index + 1}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide">{item.title}</p>
                </li>
              );
            })}
          </ol>
        </header>

        <main className="min-h-[320px] space-y-4">{renderStepContent()}</main>

        {currentStepError ? <p className="text-sm text-red-400">{currentStepError}</p> : null}

        <footer className="flex flex-col gap-3 border-t border-neutral-900 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <button
              type="button"
              onClick={handleResetDraft}
              className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400 transition hover:border-neutral-600 hover:text-white"
            >
              Сбросить черновик
            </button>
            <span>Шаг {step + 1} из {STEP_CONFIG.length}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={step === 0 ? handleCancel : handlePrev}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-600 hover:text-white"
              disabled={isSubmitting}
            >
              {step === 0 ? 'Закрыть' : 'Назад'}
            </button>
            {step < STEP_CONFIG.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled || isSubmitting}
                className="rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isNextDisabled || isSubmitting}
                data-testid="wizard-submit"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Создаём проект
                  </span>
                ) : (
                  'Создать проект'
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
