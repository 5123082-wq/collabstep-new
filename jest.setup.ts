type Listener = (event: { matches: boolean; media: string }) => void;
const listeners = new Map<string, Set<Listener>>();
const eventListenerWrappers = new Map<
  string,
  Map<EventListenerOrEventListenerObject, Listener>
>();
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

    const resolveEventListener = (
      listener: EventListenerOrEventListenerObject
    ): Listener => {
      if (typeof listener === 'function') {
        return (event) => (listener as EventListener)(event as unknown as Event);
      }

      return (event) => {
        if (typeof listener.handleEvent === 'function') {
          listener.handleEvent(event as unknown as Event);
        }
      };
    };

    const mediaQueryList: MediaQueryList = {
      media: query,
      matches,
      onchange: null,
      addEventListener: (_event: string, listener: EventListenerOrEventListenerObject) => {
        const wrappersForQuery =
          eventListenerWrappers.get(query) ??
          new Map<EventListenerOrEventListenerObject, Listener>();
        const wrapper = resolveEventListener(listener);
        wrappersForQuery.set(listener, wrapper);
        eventListenerWrappers.set(query, wrappersForQuery);
        listenersForQuery.add(wrapper);
      },
      removeEventListener: (_event: string, listener: EventListenerOrEventListenerObject) => {
        const wrappersForQuery = eventListenerWrappers.get(query);
        const wrapper = wrappersForQuery?.get(listener);
        if (!wrapper) {
          return;
        }
        listenersForQuery.delete(wrapper);
        wrappersForQuery?.delete(listener);
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
