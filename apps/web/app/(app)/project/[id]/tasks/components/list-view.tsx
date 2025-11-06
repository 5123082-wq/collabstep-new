'use client';

import { useState, useMemo } from 'react';
import type { TaskTreeNode } from '@/domain/projects/types';
import TaskRow from './task-row';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type ListViewProps = {
  tree: TaskTreeNode[];
  projectKey?: string;
  onTaskClick?: (taskId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  showTableFormat?: boolean; // Enable table format with columns
  sortBy?: 'title' | 'status' | 'priority' | 'dueDate' | 'assignee' | null;
  groupBy?: 'status' | 'assignee' | 'priority' | null;
};

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee';
type GroupField = 'status' | 'assignee' | 'priority';
type FlatTaskNode = TaskTreeNode & { depth: number };

export function ListView({
  tree,
  projectKey: projectKeyProp = 'PROJ',
  onTaskClick,
  isLoading,
  emptyMessage = 'Задачи не найдены',
  showTableFormat = false,
  sortBy = null,
  groupBy = null
}: ListViewProps) {
  const projectKey: string = projectKeyProp;
  const [sortField, setSortField] = useState<SortField | null>(sortBy || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupField, setGroupField] = useState<GroupField | null>(groupBy || null);

  // Flatten tree for sorting
  const flattenTree = (nodes: TaskTreeNode[]): FlatTaskNode[] => {
    const result: FlatTaskNode[] = [];
    const traverse = (nodes: TaskTreeNode[], depth: number) => {
      for (const node of nodes) {
        result.push({ ...node, depth });
        if (node.children && node.children.length > 0) {
          traverse(node.children, depth + 1);
        }
      }
    };
    traverse(nodes, 0);
    return result;
  };

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const flattened = flattenTree(tree);
    if (!sortField) {
      return flattened;
    }

    const sorted = [...flattened].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ru');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, med: 2, low: 1 };
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          comparison = aPriority - bPriority;
          break;
        case 'dueDate':
          const aDate = a.dueAt ? new Date(a.dueAt).getTime() : 0;
          const bDate = b.dueAt ? new Date(b.dueAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case 'assignee':
          comparison = (a.assigneeId || '').localeCompare(b.assigneeId || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tree, sortField, sortDirection]);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (!groupField) {
      return { '': sortedTasks };
    }

    const groups: Record<string, FlatTaskNode[]> = {};

    for (const task of sortedTasks) {
      let key = '';
      switch (groupField) {
        case 'status':
          key = task.status;
          break;
        case 'assignee':
          key = task.assigneeId || 'Без исполнителя';
          break;
        case 'priority':
          key = task.priority || 'Без приоритета';
          break;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key]!.push(task);
    }

    return groups;
  }, [sortedTasks, groupField]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleGroup = (field: GroupField | null) => {
    setGroupField(field);
  };

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

  const renderTaskList = (tasks: TaskTreeNode[]) => {
    // Create a map of all tasks from the original tree for parent lookup
    const allTasksMap = new Map<string, TaskTreeNode>();
    const flattenTree = (nodes: TaskTreeNode[]) => {
      for (const node of nodes) {
        allTasksMap.set(node.id, node);
        if (node.children) {
          flattenTree(node.children);
        }
      }
    };
    flattenTree(tree);

    // Create a set of task IDs that should be displayed
    const displayTaskIds = new Set(tasks.map((t) => t.id));

    // Rebuild tree structure preserving parent-child relationships
    const taskMap = new Map<string, TaskTreeNode & { children?: TaskTreeNode[] }>();
    const roots: TaskTreeNode[] = [];

    // First pass: create nodes only for tasks that should be displayed
    // Include parents even if they're not in the filtered list (for proper hierarchy)
    for (const task of tasks) {
      taskMap.set(task.id, { ...task, children: [] });
      
      // Ensure parent is in the map if it exists in the original tree
      if (task.parentId && allTasksMap.has(task.parentId) && !taskMap.has(task.parentId)) {
        const parentTask = allTasksMap.get(task.parentId)!;
        taskMap.set(task.parentId, { ...parentTask, children: [] });
      }
    }

    // Second pass: build tree relationships
    for (const task of tasks) {
      const node = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        const parent = taskMap.get(task.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Filter roots to only show tasks that are actually in the display list
    const filteredRoots = roots.filter((node) => {
      const shouldInclude = (n: TaskTreeNode): boolean => {
        if (displayTaskIds.has(n.id)) {
          return true;
        }
        // Include if any descendant should be displayed
        if (n.children) {
          return n.children.some((child) => shouldInclude(child));
        }
        return false;
      };
      return shouldInclude(node);
    });

    return (
      <div className="flex flex-col gap-2" data-view-mode="list">
        {filteredRoots.map((node) => (
          <ListNode
            key={node.id}
            node={node}
            depth={0}
            projectKey={projectKey}
            showMetadata={showTableFormat}
            {...(onTaskClick ? { onTaskClick } : {})}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Сортировка:</span>
          <button
            onClick={() => handleSort('title')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              sortField === 'title'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Название
            {sortField === 'title' && (
              sortDirection === 'asc' ? <ChevronDown className="ml-1 inline h-3 w-3 rotate-180" /> : <ChevronDown className="ml-1 inline h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('status')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              sortField === 'status'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Статус
            {sortField === 'status' && (
              sortDirection === 'asc' ? <ChevronDown className="ml-1 inline h-3 w-3 rotate-180" /> : <ChevronDown className="ml-1 inline h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('dueDate')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              sortField === 'dueDate'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Срок
            {sortField === 'dueDate' && (
              sortDirection === 'asc' ? <ChevronDown className="ml-1 inline h-3 w-3 rotate-180" /> : <ChevronDown className="ml-1 inline h-3 w-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('priority')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              sortField === 'priority'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            Приоритет
            {sortField === 'priority' && (
              sortDirection === 'asc' ? <ChevronDown className="ml-1 inline h-3 w-3 rotate-180" /> : <ChevronDown className="ml-1 inline h-3 w-3" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Группировка:</span>
          <button
            onClick={() => handleGroup(groupField === 'status' ? null : 'status')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              groupField === 'status'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            По статусу
          </button>
          <button
            onClick={() => handleGroup(groupField === 'assignee' ? null : 'assignee')}
            className={cn(
              'rounded-lg border px-2 py-1 text-xs transition',
              groupField === 'assignee'
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
            )}
          >
            По исполнителю
          </button>
        </div>
      </div>

      {/* Table header if table format */}
      {showTableFormat && (
        <div className="grid grid-cols-[1fr_120px_100px_120px_100px_80px] gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs font-semibold text-neutral-400">
          <div className="flex items-center gap-2">
            <button onClick={() => handleSort('title')} className="hover:text-indigo-400">
              Задача ⇅
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => handleSort('status')} className="hover:text-indigo-400">
              Статус ⇅
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSort('assignee')} className="hover:text-indigo-400">
              Исполнитель ⇅
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSort('dueDate')} className="hover:text-indigo-400">
              Срок ⇅
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSort('priority')} className="hover:text-indigo-400">
              Приоритет ⇅
            </button>
          </div>
          <div className="text-right">Оценка</div>
        </div>
      )}

      {/* Grouped or flat list */}
      {groupField ? (
        <div className="space-y-4">
          {Object.entries(groupedTasks).map(([groupKey, tasks]) => (
            <div key={groupKey} className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-300">{groupKey}</h3>
              {renderTaskList(tasks)}
            </div>
          ))}
        </div>
      ) : (
        renderTaskList(sortedTasks)
      )}
    </div>
  );
}

type ListNodeProps = {
  node: TaskTreeNode;
  depth: number;
  projectKey: string;
  showMetadata?: boolean;
  onTaskClick?: (taskId: string) => void;
};

function ListNode({ node, depth, projectKey, showMetadata = false, onTaskClick }: ListNodeProps) {
  const children = node.children;
  const hasChildren = Array.isArray(children) && children.length > 0;
  const [expanded, setExpanded] = useState(true);

  return (
    <TaskRow
      task={node}
      projectKey={projectKey}
      depth={depth}
      isExpanded={hasChildren ? expanded : undefined}
      showMetadata={showMetadata}
      onToggle={
        hasChildren
          ? () => {
              setExpanded((prev) => !prev);
            }
          : undefined
      }
      {...(onTaskClick ? { onSelect: onTaskClick } : {})}
    >
      {hasChildren && expanded
        ? children!.map((child) => (
            <ListNode
              key={child.id}
              node={child}
              depth={depth + 1}
              projectKey={projectKey}
              showMetadata={showMetadata}
              {...(onTaskClick ? { onTaskClick } : {})}
            />
          ))
        : null}
    </TaskRow>
  );
}

export default ListView;


