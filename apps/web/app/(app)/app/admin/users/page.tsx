'use client';

import { useState } from 'react';
import { Search, Filter, Shield, UserX, UserCheck, MoreVertical, Mail } from 'lucide-react';
import { toast } from '@/lib/ui/toast';
import clsx from 'clsx';

interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'suspended' | 'banned' | 'pending';
  lastLoginAt: string;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    displayName: 'Иван Петров',
    roles: ['FOUNDER'],
    status: 'active',
    lastLoginAt: '2025-01-30T10:30:00Z',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    email: 'tester@example.com',
    displayName: 'Тестировщик Сидоров',
    roles: ['SPECIALIST'],
    status: 'active',
    lastLoginAt: '2025-01-29T15:20:00Z',
    createdAt: '2024-06-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'suspended@example.com',
    displayName: 'Заблокированный Пользователь',
    roles: ['USER'],
    status: 'suspended',
    lastLoginAt: '2025-01-28T08:00:00Z',
    createdAt: '2024-03-20T00:00:00Z'
  }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSuspend = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'suspended' as const } : u))
    );
    toast('Пользователь заблокирован', 'warning');
  };

  const handleActivate = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: 'active' as const } : u))
    );
    toast('Пользователь активирован', 'success');
  };

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
              <option value="banned">Забаненные</option>
              <option value="pending">Ожидают активации</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                          : user.status === 'banned'
                          ? 'bg-rose-500/20 text-rose-100'
                          : 'bg-neutral-500/20 text-neutral-100'
                      )}
                    >
                      {user.status === 'active'
                        ? 'Активен'
                        : user.status === 'suspended'
                        ? 'Заблокирован'
                        : user.status === 'banned'
                        ? 'Забанен'
                        : 'Ожидает'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'suspended' || user.status === 'banned' ? (
                        <button
                          onClick={() => handleActivate(user.id)}
                          className="rounded-xl border border-green-500/40 bg-green-500/10 p-2 text-green-100 transition hover:bg-green-500/20"
                          title="Активировать"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="rounded-xl border border-orange-500/40 bg-orange-500/10 p-2 text-orange-100 transition hover:bg-orange-500/20"
                          title="Заблокировать"
                        >
                          <UserX className="h-4 w-4" />
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
      </div>

      {filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-12 text-center">
          <p className="text-sm text-neutral-400">Пользователи не найдены</p>
        </div>
      )}
    </div>
  );
}

