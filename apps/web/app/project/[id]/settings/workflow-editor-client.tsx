'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskStatus } from '@/domain/projects/types';

const ALLOWED_STATUSES: TaskStatus[] = ['new', 'in_progress', 'review', 'done', 'blocked'];
const MIN_STATUSES = 3;
const MAX_STATUSES = 7;

type WorkflowEditorClientProps = {
  projectId: string;
};

type WorkflowResponse = {
  projectId: string;
  statuses: TaskStatus[];
};

export function WorkflowEditorClient({ projectId }: WorkflowEditorClientProps) {
  const [statuses, setStatuses] = useState<TaskStatus[]>(ALLOWED_STATUSES.slice(0, 4));
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<TaskStatus | ''>('');

  const availableToAdd = useMemo(() => {
    return ALLOWED_STATUSES.filter((status) => !statuses.includes(status));
  }, [statuses]);

  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/projects/${projectId}/workflow`);
      if (!response.ok) {
        throw new Error('Не удалось получить workflow');
      }
      const data = (await response.json()) as WorkflowResponse;
      if (Array.isArray(data.statuses) && data.statuses.length >= MIN_STATUSES) {
        setStatuses(data.statuses as TaskStatus[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  const handleAdd = () => {
    if (!candidate || statuses.includes(candidate) || statuses.length >= MAX_STATUSES) {
      return;
    }
    setStatuses((current) => [...current, candidate]);
    setCandidate('');
  };

  const handleRemove = (status: TaskStatus) => {
    setStatuses((current) => current.filter((item) => item !== status));
  };

  const handleReset = () => {
    void loadWorkflow();
    setCandidate('');
    setSuccess(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (statuses.length < MIN_STATUSES || statuses.length > MAX_STATUSES) {
      setError(`Количество статусов должно быть от ${MIN_STATUSES} до ${MAX_STATUSES}.`);
      return;
    }
    const unique = Array.from(new Set(statuses));
    if (unique.length !== statuses.length) {
      setError('Статусы должны быть уникальными.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/workflow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statuses })
      });
      if (!response.ok) {
        throw new Error('Не удалось сохранить workflow');
      }
      const data = (await response.json()) as WorkflowResponse;
      setStatuses(data.statuses as TaskStatus[]);
      setSuccess('Workflow обновлён');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Статусы задач</h3>
          <p className="text-sm text-neutral-400">Настройте канбан-этапы, доступные в проекте.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>Минимум {MIN_STATUSES}</span>
          <span className="rounded-full bg-neutral-800 px-2 py-1 text-neutral-200">Максимум {MAX_STATUSES}</span>
        </div>
      </header>
      {isLoading ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-400">Загрузка…</div>
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {statuses.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
                <span className="text-sm font-medium text-white">{status}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(status)}
                  className="rounded-lg border border-neutral-700 px-3 py-1 text-xs text-neutral-300 transition hover:border-red-400 hover:text-white"
                  disabled={statuses.length <= MIN_STATUSES}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/80 p-4">
            <select
              className="min-w-[160px] rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              value={candidate}
              onChange={(event) => setCandidate(event.target.value as TaskStatus | '')}
              disabled={availableToAdd.length === 0}
            >
              <option value="">Выберите статус</option>
              {availableToAdd.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
              disabled={!candidate || statuses.length >= MAX_STATUSES}
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:border-indigo-400 hover:text-white"
            >
              Сбросить
            </button>
          </div>
        </div>
      )}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-400">{success}</p> : null}
      <div className="flex justify-end gap-3 border-t border-neutral-800 pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение…' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

export default WorkflowEditorClient;
