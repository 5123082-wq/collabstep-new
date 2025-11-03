'use client';

import { useState } from 'react';
import { UserSearch, Activity, Database, RefreshCw } from 'lucide-react';
import { toast } from '@/lib/ui/toast';

interface ImpersonationSession {
  id: string;
  targetUser: string;
  targetEmail: string;
  startedAt: string;
  endedAt?: string;
}

const mockSessions: ImpersonationSession[] = [
  {
    id: '1',
    targetUser: 'Иван Петров',
    targetEmail: 'user@example.com',
    startedAt: '2025-01-30T14:00:00Z',
    endedAt: '2025-01-30T15:30:00Z'
  }
];

export default function AdminSupportPage() {
  const [sessions] = useState<ImpersonationSession[]>(mockSessions);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-neutral-50">Support Tools</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Инструменты поддержки: имперсонация, сессии, демо-данные
          </p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => toast('TODO: Начать имперсонацию', 'info')}
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-left transition hover:border-indigo-500/40"
        >
          <div className="rounded-xl bg-indigo-500/20 p-3 w-fit">
            <UserSearch className="h-6 w-6 text-indigo-100" />
          </div>
          <h3 className="mt-4 font-semibold text-neutral-50">Имперсонация</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Войти как другой пользователь для диагностики
          </p>
        </button>

        <button
          onClick={() => toast('TODO: Активные сессии', 'info')}
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-left transition hover:border-indigo-500/40"
        >
          <div className="rounded-xl bg-green-500/20 p-3 w-fit">
            <Activity className="h-6 w-6 text-green-100" />
          </div>
          <h3 className="mt-4 font-semibold text-neutral-50">Активные сессии</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Просмотр и управление пользовательскими сессиями
          </p>
        </button>

        <button
          onClick={() => toast('TODO: Регенерация демо-данных', 'info')}
          className="group rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-left transition hover:border-indigo-500/40"
        >
          <div className="rounded-xl bg-orange-500/20 p-3 w-fit">
            <RefreshCw className="h-6 w-6 text-orange-100" />
          </div>
          <h3 className="mt-4 font-semibold text-neutral-50">Регенерация данных</h3>
          <p className="mt-1 text-sm text-neutral-400">
            Обновить демо-данные и моки
          </p>
        </button>
      </div>

      {/* Impersonation Sessions */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-50">История имперсонаций</h2>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-50">{session.targetUser}</p>
                  <p className="text-sm text-neutral-400">{session.targetEmail}</p>
                </div>
                <div className="text-sm text-neutral-500">
                  {new Date(session.startedAt).toLocaleString('ru-RU')}
                  {session.endedAt && (
                    <span className="block text-xs">
                      Завершено: {new Date(session.endedAt).toLocaleTimeString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sessions.length === 0 && (
          <p className="text-center text-sm text-neutral-400">Нет активных сессий имперсонации</p>
        )}
      </div>

      {/* System Health */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-50">Системное здоровье</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: 'API', status: 'healthy', latency: '120ms' },
            { name: 'База данных', status: 'healthy', latency: '45ms' },
            { name: 'Кэш', status: 'degraded', latency: '250ms' }
          ].map((service) => (
            <div
              key={service.name}
              className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-50">{service.name}</p>
                  <p className="text-xs text-neutral-400">{service.latency}</p>
                </div>
                <span
                  className={`h-2 w-2 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

