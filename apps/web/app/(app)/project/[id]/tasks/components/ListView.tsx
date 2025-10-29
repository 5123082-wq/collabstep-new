'use client';

import type { TaskTreeNode } from '@/domain/projects/types';
import TaskRow from './TaskRow';

type ListViewProps = {
  tree: TaskTreeNode[];
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

export function ListView({ tree, onTaskClick, isLoading, emptyMessage = 'Задачи не найдены' }: ListViewProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-neutral-900 bg-neutral-950/40 text-sm text-neutral-500">
        Загрузка задач...
      </div>
    );
  }

  if (!tree || tree.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/30 text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tree.map((node) => (
        <ListNode key={node.id} node={node} depth={0} {...(onTaskClick ? { onTaskClick } : {})} />
      ))}
    </div>
  );
}

type ListNodeProps = {
  node: TaskTreeNode;
  depth: number;
  onTaskClick?: (taskId: string) => void;
};

function ListNode({ node, depth, onTaskClick }: ListNodeProps) {
  const children = node.children;
  return (
    <TaskRow task={node} depth={depth} {...(onTaskClick ? { onSelect: onTaskClick } : {})}>
      {children && children.length > 0
        ? children.map((child) => (
            <ListNode key={child.id} node={child} depth={depth + 1} {...(onTaskClick ? { onTaskClick } : {})} />
          ))
        : null}
    </TaskRow>
  );
}

export default ListView;
