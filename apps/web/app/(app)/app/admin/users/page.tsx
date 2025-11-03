'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Shield, UserX, UserCheck, MoreVertical } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import clsx from 'clsx';
import type { AdminUserView } from '@collabverse/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'suspended' | 'invited';
  lastLoginAt: string;
  createdAt: string;
}

function convertAdminUserToUser(adminUser: AdminUserView): User {
  return {
    id: adminUser.userId,
    email: adminUser.email || adminUser.userId,
    displayName: adminUser.name,
    roles: adminUser.roles,
    status: adminUser.status,
    lastLoginAt: adminUser.updatedAt, // Using updatedAt as lastLoginAt approximation
    createdAt: adminUser.updatedAt // Using updatedAt as createdAt approximation
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users', {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить пользователей');
      }
      const data = (await response.json()) as { items: AdminUserView[] };
      const converted = data.items.map(convertAdminUserToUser);
      setUsers(converted);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      toast('Не удалось загрузить пользователей', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSuspend = useCallback(
    async (userId: string) => {
      setUpdatingIds((prev) => new Set(prev).add(userId));
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' })
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || 'Не удалось обновить пользователя');
        }

        const data = (await response.json()) as { item: AdminUserView };
        const updatedUser = convertAdminUserToUser(data.item);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
        toast('Пользователь заблокирован', 'warning');
      } catch (err) {
        console.error(err);
        toast(err instanceof Error ? err.message : 'Не удалось заблокировать пользователя', 'error');
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    []
  );

  const handleActivate = useCallback(
    async (userId: string) => {
      setUpdatingIds((prev) => new Set(prev).add(userId));
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' })
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || 'Не удалось обновить пользователя');
        }

        const data = (await response.json()) as { item: AdminUserView };
        const updatedUser = convertAdminUserToUser(data.item);
        setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
        toast('Пользователь активирован', 'success');
      } catch (err) {
        console.error(err);
        toast(err instanceof Error ? err.message : 'Не удалось активировать пользователя', 'error');
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    },
    []
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-50">Управление пользователями</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Блокировки, разрешения и управление доступом пользователей
            </p>
          </div>
          <button
            onClick={() => toast('TODO: Пригласить пользователя', 'info')}
            className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:border-indigo-400 hover:bg-indigo-500/20"
          >
            + Пригласить
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по email или имени..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-2 pl-10 pr-4 text-sm text-neutral-100 placeholder-neutral-500 transition focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-sm text-neutral-100 transition focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="suspended">Заблокированные</option>
              <option value="invited">Приглашённые</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-500 border-r-transparent"></div>
          <p className="mt-4 text-sm text-neutral-400">Загрузка пользователей...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6">
          <p className="text-sm text-rose-100">{error}</p>
          <button
            onClick={() => void loadUsers()}
            className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/30"
          >
            Повторить попытку
          </button>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-800 bg-neutral-950/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Роли
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Последний вход
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Статус
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition hover:bg-neutral-900/40"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-50">{user.displayName}</p>
                      <p className="text-sm text-neutral-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-100"
                        >
                          <Shield className="h-3 w-3" />
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {new Date(user.lastLoginAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-100'
                          : user.status === 'suspended'
                          ? 'bg-orange-500/20 text-orange-100'
                          : 'bg-blue-500/20 text-blue-100'
                      )}
                    >
                      {user.status === 'active'
                        ? 'Активен'
                        : user.status === 'suspended'
                        ? 'Заблокирован'
                        : 'Приглашён'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status !== 'active' ? (
                        <button
                          onClick={() => handleActivate(user.id)}
                          disabled={updatingIds.has(user.id)}
                          className={clsx(
                            'rounded-xl border border-green-500/40 bg-green-500/10 p-2 text-green-100 transition hover:bg-green-500/20',
                            updatingIds.has(user.id) && 'cursor-not-allowed opacity-50'
                          )}
                          title="Активировать"
                        >
                          {updatingIds.has(user.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          disabled={updatingIds.has(user.id)}
                          className={clsx(
                            'rounded-xl border border-orange-500/40 bg-orange-500/10 p-2 text-orange-100 transition hover:bg-orange-500/20',
                            updatingIds.has(user.id) && 'cursor-not-allowed opacity-50'
                          )}
                          title="Заблокировать"
                        >
                          {updatingIds.has(user.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => toast('TODO: Открыть настройки', 'info')}
                        className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-2 text-neutral-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                        title="Настройки"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-12 text-center">
          <p className="text-sm text-neutral-400">Пользователи не найдены</p>
        </div>
      )}
    </div>
  );
}

