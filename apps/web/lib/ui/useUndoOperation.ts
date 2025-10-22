'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast, toastWithAction } from '@/lib/ui/toast';

type UndoEntry = {
  label: string;
  undo: () => Promise<void> | void;
  successMessage?: string;
  tone?: 'info' | 'success' | 'warning';
  durationMs?: number;
};

export function useUndoOperation() {
  const entryRef = useRef<UndoEntry | null>(null);
  const isUndoingRef = useRef(false);

  const clear = useCallback(() => {
    entryRef.current = null;
    isUndoingRef.current = false;
  }, []);

  const performUndo = useCallback(async () => {
    if (!entryRef.current || isUndoingRef.current) {
      return;
    }
    isUndoingRef.current = true;
    const entry = entryRef.current;
    entryRef.current = null;
    try {
      await entry.undo();
      toast(entry.successMessage ?? 'Изменения отменены', 'success');
    } catch (error) {
      console.error(error);
      toast('Не удалось отменить операцию', 'warning');
    } finally {
      isUndoingRef.current = false;
    }
  }, []);

  const register = useCallback(
    (entry: UndoEntry) => {
      entryRef.current = entry;
      isUndoingRef.current = false;
      toastWithAction({
        message: entry.label,
        tone: entry.tone ?? 'info',
        actionLabel: 'Отменить',
        duration: entry.durationMs ?? 6000,
        onAction: async () => {
          await performUndo();
        }
      });
    },
    [performUndo]
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        void performUndo();
      }
    };
    window.addEventListener('keydown', listener);
    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, [performUndo]);

  return { register, clear, undo: performUndo };
}
