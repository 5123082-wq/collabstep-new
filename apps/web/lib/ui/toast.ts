export const TOAST_EVENT = 'cv:toast';

export type ToastPayload = {
  id?: string;
  message: string;
  tone?: 'info' | 'success' | 'warning';
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  duration?: number;
};

export function toast(message: string, tone: ToastPayload['tone'] = 'info'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const detail: ToastPayload = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    tone
  };

  document.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail }));
}

export function toastWithAction(payload: Omit<ToastPayload, 'id'> & { actionLabel: string; onAction: () => void | Promise<void> }): void {
  if (typeof document === 'undefined') {
    return;
  }

  const detail: ToastPayload = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tone: payload.tone,
    message: payload.message,
    actionLabel: payload.actionLabel,
    onAction: payload.onAction,
    duration: payload.duration
  };

  document.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail }));
}
