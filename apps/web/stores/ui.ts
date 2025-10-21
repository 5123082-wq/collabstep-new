import { create } from 'zustand';

export type Drawer = null | 'chats' | 'notifications' | 'task' | 'document' | 'assistant' | 'rail-settings';
export type Dialog = null | 'invite';

type UIState = {
  railExpanded: boolean;
  setRailExpanded: (value: boolean) => void;

  drawer: Drawer;
  openDrawer: (drawer: Drawer) => void;
  closeDrawer: () => void;

  dialog: Dialog;
  openDialog: (dialog: Dialog) => void;
  closeDialog: () => void;

  unreadChats: number;
  unreadNotifications: number;
  setUnreadChats: (value: number) => void;
  setUnreadNotifications: (value: number) => void;
};

export const useUI = create<UIState>((set) => ({
  railExpanded: false,
  setRailExpanded: (value) => set({ railExpanded: value }),

  drawer: null,
  openDrawer: (drawer) => set({ drawer }),
  closeDrawer: () => set({ drawer: null }),

  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),

  unreadChats: 2,
  unreadNotifications: 7,
  setUnreadChats: (value) => set({ unreadChats: value }),
  setUnreadNotifications: (value) => set({ unreadNotifications: value })
}));
