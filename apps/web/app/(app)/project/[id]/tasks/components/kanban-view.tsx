'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus } from '@/domain/projects/types';
import { cn } from '@/lib/utils';
import TaskCard, { TASK_STATUS_LABELS } from './task-card';

type KanbanViewProps = {
  statuses: TaskStatus[];
  tasks: Task[];
  projectKey?: string;
  onTaskDrop: (taskId: string, toStatus: TaskStatus) => Promise<void> | void;
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
  groupBy?: 'none' | 'assignee' | 'priority'; // Swim lanes grouping
};

type Column = {
  status: TaskStatus;
  tasks: Task[];
};

type SwimLane = {
  id: string;
  label: string;
  tasks: Task[];
};

export function KanbanView({
  statuses,
  tasks,
  projectKey = 'PROJ',
  onTaskDrop,
  onTaskClick,
  isLoading,
  groupBy = 'none'
}: KanbanViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo<Column[]>(() => {
    return statuses.map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status)
    }));
  }, [statuses, tasks]);

  // Group tasks by swim lane
  const swimLanes = useMemo<SwimLane[]>(() => {
    if (groupBy === 'none') {
      return [{ id: 'all', label: 'Все задачи', tasks }];
    }

    const lanes: Map<string, { label: string; tasks: Task[] }> = new Map();

    for (const task of tasks) {
      let key = '';
      let label = '';

      if (groupBy === 'assignee') {
        key = task.assigneeId || 'unassigned';
        label = task.assigneeId ? `Исполнитель: ${task.assigneeId}` : 'Без исполнителя';
      } else if (groupBy === 'priority') {
        key = task.priority || 'no-priority';
        const priorityLabels: Record<string, string> = {
          urgent: 'Срочно',
          high: 'Высокий',
          med: 'Средний',
          low: 'Низкий',
          'no-priority': 'Без приоритета'
        };
        label = `Приоритет: ${priorityLabels[key]}`;
      }

      if (!lanes.has(key)) {
        lanes.set(key, { label, tasks: [] });
      }
      lanes.get(key)!.tasks.push(task);
    }

    return Array.from(lanes.entries()).map(([id, laneData]) => ({
      id,
      label: laneData.label,
      tasks: laneData.tasks
    }));
  }, [tasks, groupBy]);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTaskId(null);
    const { over, active } = event;
    if (!over) {
      return;
    }
    const overStatus = over.data.current?.status as TaskStatus | undefined;
    const activeStatus = active.data.current?.status as TaskStatus | undefined;
    if (!overStatus || !active.id || overStatus === activeStatus) {
      return;
    }
    await onTaskDrop(String(active.id), overStatus);
  };

  // Calculate totals for each column
  const columnTotals = useMemo(() => {
    const totals = new Map<TaskStatus, number>();
    for (const column of columns) {
      totals.set(column.status, column.tasks.length);
    }
    return totals;
  }, [columns]);

  if (groupBy !== 'none') {
    // Render with swim lanes
    return (
      <DndContext
        collisionDetection={closestCenter}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={(event) => {
          setActiveTaskId(String(event.active.id));
        }}
      >
        <div className="space-y-4" data-view-mode="kanban-swimlanes">
          {swimLanes.map((lane) => (
            <div key={lane.id} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-sm font-semibold text-neutral-300">{lane.label}</h3>
                <span className="text-xs text-neutral-500">{lane.tasks.length} задач</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {columns.map((column) => {
                  const laneTasks = column.tasks.filter((task) => lane.tasks.some((t) => t.id === task.id));
                  return (
                    <KanbanColumn
                      key={`${lane.id}-${column.status}`}
                      column={{ ...column, tasks: laneTasks }}
                      projectKey={projectKey}
                      isLoading={Boolean(isLoading && laneTasks.length === 0)}
                      activeTaskId={activeTaskId}
                      showCount={true}
                      totalCount={laneTasks.length}
                      {...(onTaskClick ? { onTaskClick } : {})}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    );
  }

  // Standard Kanban view
  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={(event) => {
        setActiveTaskId(String(event.active.id));
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-view-mode="kanban">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            column={column}
            projectKey={projectKey}
            isLoading={Boolean(isLoading && column.tasks.length === 0)}
            activeTaskId={activeTaskId}
            showCount={true}
            totalCount={columnTotals.get(column.status) || 0}
            {...(onTaskClick ? { onTaskClick } : {})}
          />
        ))}
      </div>
    </DndContext>
  );
}

type KanbanColumnProps = {
  column: Column;
  projectKey?: string;
  isLoading: boolean;
  onTaskClick?: (taskId: string) => void;
  activeTaskId: string | null;
  showCount?: boolean;
  totalCount?: number;
};

function KanbanColumn({
  column,
  projectKey,
  isLoading,
  onTaskClick,
  activeTaskId,
  showCount = false,
  totalCount
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.status}`, data: { status: column.status } });
  
  // Calculate metrics
  const overdueCount = column.tasks.filter(
    (task) => task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done'
  ).length;
  const highPriorityCount = column.tasks.filter((task) => task.priority === 'high' || task.priority === 'urgent').length;

  return (
    <div
      ref={setNodeRef}
      data-status={column.status}
      className={cn(
        'flex min-h-[420px] flex-col gap-3 rounded-2xl border border-neutral-900 bg-neutral-950/40 p-3 transition',
        isOver && 'border-indigo-500/60 bg-neutral-900/60'
      )}
    >
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-200">{TASK_STATUS_LABELS[column.status]}</p>
          {showCount && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-neutral-500">
                {column.tasks.length}
                {totalCount !== undefined && totalCount !== column.tasks.length ? ` / ${totalCount}` : ''} задач
              </p>
              {overdueCount > 0 && (
                <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">
                  {overdueCount} просрочено
                </span>
              )}
              {highPriorityCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                  {highPriorityCount} важных
                </span>
              )}
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            projectKey={projectKey}
            isActive={activeTaskId === task.id}
            {...(onTaskClick ? { onTaskClick } : {})}
          />
        ))}
        {column.tasks.length === 0 && !isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-800 p-4 text-xs text-neutral-500">
            Перетащите задачу сюда
          </div>
        ) : null}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-neutral-900 bg-neutral-900/40 text-xs text-neutral-500">
            Загрузка...
          </div>
        ) : null}
      </div>
    </div>
  );
}

type DraggableTaskCardProps = {
  task: Task;
  projectKey?: string;
  onTaskClick?: (taskId: string) => void;
  isActive: boolean;
};

function DraggableTaskCard({ task, projectKey, onTaskClick, isActive }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status }
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('touch-none', (isDragging || isActive) && 'opacity-75')}
      data-task-id={task.id}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} projectKey={projectKey} {...(onTaskClick ? { onClick: onTaskClick } : {})} />
    </div>
  );
}

export default KanbanView;


