type Listener = (event: { matches: boolean; media: string }) => void;
const listeners = new Map<string, Set<Listener>>();
const mediaState = new Map<string, boolean>();

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  require('@testing-library/jest-dom');
}

if (typeof global.matchMedia !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).matchMedia = (query: string): MediaQueryList => {
    const initial = mediaState.get(query) ?? false;
    let matches = initial;
    const listenersForQuery = listeners.get(query) ?? new Set<Listener>();
    listeners.set(query, listenersForQuery);

    const mediaQueryList: MediaQueryList = {
      media: query,
      matches,
      onchange: null,
      addEventListener: (_event, listener) => {
        listenersForQuery.add(listener as Listener);
      },
      removeEventListener: (_event, listener) => {
        listenersForQuery.delete(listener as Listener);
      },
      addListener: (listener: Listener) => {
        listenersForQuery.add(listener);
      },
      removeListener: (listener: Listener) => {
        listenersForQuery.delete(listener);
      },
      dispatchEvent: () => true
    } as MediaQueryList;

    Object.defineProperty(mediaQueryList, 'matches', {
      get: () => matches,
      set: (value: boolean) => {
        matches = value;
        listenersForQuery.forEach((listener) => listener({ matches, media: query }));
        mediaState.set(query, matches);
      }
    });

    return mediaQueryList;
  };
}

export function setMatchMediaMatches(query: string, value: boolean) {
  global.matchMedia(query);
  mediaState.set(query, value);
  const listenersForQuery = listeners.get(query);
  if (!listenersForQuery) {
    return;
  }

  listenersForQuery.forEach((listener) => listener({ matches: value, media: query }));
}
