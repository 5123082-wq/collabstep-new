'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TaskTreeNode } from '@/domain/projects/types';
import TaskRow from './TaskRow';

type ListViewProps = {
  tree: TaskTreeNode[];
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
};

export function ListView({ tree, onTaskClick, isLoading, emptyMessage = 'Задачи не найдены' }: ListViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      const collect = (nodes: TaskTreeNode[]) => {
        for (const node of nodes) {
          if (Array.isArray(node.children) && node.children.length > 0) {
            if (!next.has(node.id)) {
              next.add(node.id);
            }
            collect(node.children);
          }
        }
      };
      collect(tree);
      return next;
    });
  }, [tree]);

  const handleToggle = useCallback((taskId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

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
        <ListNode
          key={node.id}
          node={node}
          depth={0}
          expandedNodes={expandedNodes}
          onToggle={handleToggle}
          {...(onTaskClick ? { onTaskClick } : {})}
        />
      ))}
    </div>
  );
}

type ListNodeProps = {
  node: TaskTreeNode;
  depth: number;
  expandedNodes: Set<string>;
  onToggle: (taskId: string) => void;
  onTaskClick?: (taskId: string) => void;
};

function ListNode({ node, depth, expandedNodes, onToggle, onTaskClick }: ListNodeProps) {
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isExpanded = hasChildren ? expandedNodes.has(node.id) : false;

  return (
    <TaskRow
      task={node}
      depth={depth}
      hasChildren={hasChildren}
      isExpanded={isExpanded}
      {...(hasChildren ? { onToggleExpand: () => onToggle(node.id) } : {})}
      {...(onTaskClick ? { onSelect: onTaskClick } : {})}
    >
      {hasChildren && isExpanded
        ? node.children?.map((child) => (
            <ListNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              {...(onTaskClick ? { onTaskClick } : {})}
            />
          ))
        : null}
    </TaskRow>
  );
}

export default ListView;
