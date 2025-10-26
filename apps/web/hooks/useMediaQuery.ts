'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent | { matches: boolean }) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener?.('change', handleChange as EventListener);
    mediaQuery.addListener?.(handleChange as (event: MediaQueryListEvent) => void);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange as EventListener);
      mediaQuery.removeListener?.(handleChange as (event: MediaQueryListEvent) => void);
    };
  }, [query]);

  return matches;
}
