'use client';

import { useMemo } from 'react';
import type { AuditLogEntry } from '@collabverse/api';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Activity, Users, FileText } from 'lucide-react';

type ActivityWidgetProps = {
  activities: AuditLogEntry[];
  isLoading?: boolean;
};

export function ActivityWidget({ activities, isLoading }: ActivityWidgetProps) {
  const recentActivities = useMemo(() => {
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [activities]);

  const getActivityIcon = (action: string) => {
    if (action.includes('task')) {
      return <span className="text-indigo-400">✓</span>;
    }
    if (action.includes('file')) {
      return <FileText className="h-4 w-4 text-blue-400" />;
    }
    return <Activity className="h-4 w-4 text-neutral-400" />;
  };

  const getActivityLabel = (entry: AuditLogEntry): string => {
    const action = entry.action;
    if (action === 'task.created') return 'Создана задача';
    if (action === 'task.updated') return 'Обновлена задача';
    if (action === 'task.status_changed') return 'Изменён статус задачи';
    if (action === 'file.attached') return 'Прикреплён файл';
    if (action === 'project.updated') return 'Обновлён проект';
    return action;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-neutral-800 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-neutral-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Активность команды</h3>
        <Activity className="h-5 w-5 text-neutral-500" />
      </div>

      {recentActivities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-400">Нет недавней активности</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivities.map((entry, index) => (
            <div
              key={entry.id || index}
              className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
            >
              <div className="mt-0.5 flex-shrink-0">{getActivityIcon(entry.action)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{getActivityLabel(entry)}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  <Users className="h-3 w-3" />
                  <span>{entry.userId || entry.userEmail || 'Система'}</span>
                  <span>·</span>
                  <span>{format(new Date(entry.createdAt), 'd MMM, HH:mm', { locale: ru })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityWidget;

