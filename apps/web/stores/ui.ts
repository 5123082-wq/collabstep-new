import { create } from 'zustand';

export type Drawer = null | 'chats' | 'notifications' | 'task' | 'document' | 'assistant' | 'rail-settings';
export type Dialog = null | 'invite';

type UIState = {
  railExpanded: boolean;
  setRailExpanded: (value: boolean) => void;

  drawer: Drawer;
  openDrawer: (drawer: Drawer) => void;
  openTaskDrawer: (context: { projectId: string; taskId: string }) => void;
  closeDrawer: () => void;

  dialog: Dialog;
  openDialog: (dialog: Dialog) => void;
  closeDialog: () => void;

  unreadChats: number;
  unreadNotifications: number;
  setUnreadChats: (value: number) => void;
  setUnreadNotifications: (value: number) => void;
  taskContext: { projectId: string; taskId: string } | null;
};

export const useUI = create<UIState>((set) => ({
  railExpanded: false,
  setRailExpanded: (value) => set({ railExpanded: value }),

  drawer: null,
  openDrawer: (drawer) => set({ drawer }),
  openTaskDrawer: (context) => set({ drawer: 'task', taskContext: context }),
  closeDrawer: () => set({ drawer: null, taskContext: null }),

  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),

  unreadChats: 0,
  unreadNotifications: 0,
  setUnreadChats: (value) => set({ unreadChats: value }),
  setUnreadNotifications: (value) => set({ unreadNotifications: value }),
  taskContext: null
}));
