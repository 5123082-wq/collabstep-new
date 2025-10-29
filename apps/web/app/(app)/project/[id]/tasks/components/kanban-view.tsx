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
  onTaskDrop: (taskId: string, toStatus: TaskStatus) => Promise<void> | void;
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
};

type Column = {
  status: TaskStatus;
  tasks: Task[];
};

export function KanbanView({ statuses, tasks, onTaskDrop, onTaskClick, isLoading }: KanbanViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo<Column[]>(() => {
    return statuses.map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status)
    }));
  }, [statuses, tasks]);

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
            isLoading={Boolean(isLoading && column.tasks.length === 0)}
            activeTaskId={activeTaskId}
            {...(onTaskClick ? { onTaskClick } : {})}
          />
        ))}
      </div>
    </DndContext>
  );
}

type KanbanColumnProps = {
  column: Column;
  isLoading: boolean;
  onTaskClick?: (taskId: string) => void;
  activeTaskId: string | null;
};

function KanbanColumn({ column, isLoading, onTaskClick, activeTaskId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.status}`, data: { status: column.status } });
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
        <div>
          <p className="text-sm font-semibold text-neutral-200">{TASK_STATUS_LABELS[column.status]}</p>
          <p className="text-xs text-neutral-500">{column.tasks.length} задач</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
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
  onTaskClick?: (taskId: string) => void;
  isActive: boolean;
};

function DraggableTaskCard({ task, onTaskClick, isActive }: DraggableTaskCardProps) {
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
      <TaskCard task={task} {...(onTaskClick ? { onClick: onTaskClick } : {})} />
    </div>
  );
}

export default KanbanView;


