'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/lib/ui/toast';

type ToastConfig = {
  message: string;
  tone?: 'info' | 'success' | 'warning';
};

type ToastMap = Record<string, ToastConfig>;

export function useQueryToast(mapping: ToastMap): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mappingRef = useRef(mapping);
  const lastToastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    mappingRef.current = mapping;
  }, [mapping]);

  useEffect(() => {
    const currentParams = searchParams;
    if (!currentParams) {
      lastToastKeyRef.current = null;
      return;
    }

    const toastKey = currentParams.get('toast');
    if (!toastKey) {
      lastToastKeyRef.current = null;
      return;
    }

    if (lastToastKeyRef.current === toastKey) {
      return;
    }

    const config = mappingRef.current[toastKey];
    if (!config) {
      lastToastKeyRef.current = toastKey;
      return;
    }

    lastToastKeyRef.current = toastKey;
    toast(config.message, config.tone);

    const params = new URLSearchParams(currentParams.toString());
    params.delete('toast');
    const nextQuery = params.toString();
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams]);
}
