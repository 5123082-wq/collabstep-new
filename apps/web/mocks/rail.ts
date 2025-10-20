import { Bell, ListTodo, MessageSquare, PlusCircle, UserPlus } from 'lucide-react';
import type { QuickAction } from '@/types/quickActions';

export const defaultRailConfig: QuickAction[] = [
  {
    id: 'newProject',
    label: 'Новый проект',
    icon: PlusCircle,
    intent: 'route',
    payload: { to: '/app/projects/new' },
    section: 'actions'
  },
  {
    id: 'addTask',
    label: 'Добавить задачу',
    icon: ListTodo,
    intent: 'sheet',
    payload: { sheet: 'task' },
    section: 'actions'
  },
  {
    id: 'invite',
    label: 'Пригласить',
    icon: UserPlus,
    intent: 'dialog',
    payload: { dialog: 'invite' },
    section: 'actions'
  },
  {
    id: 'chats',
    label: 'Чаты',
    icon: MessageSquare,
    intent: 'sheet',
    payload: { sheet: 'chats' },
    section: 'communication',
    badgeSelector: (state) => {
      const casted = state as { ui?: { unreadChats?: number } };
      return casted.ui?.unreadChats ?? 0;
    }
  },
  {
    id: 'notifications',
    label: 'Уведомления',
    icon: Bell,
    intent: 'sheet',
    payload: { sheet: 'notifications' },
    section: 'communication',
    badgeSelector: (state) => {
      const casted = state as { ui?: { unreadNotifications?: number } };
      return casted.ui?.unreadNotifications ?? 0;
    }
  }
];
