import { readProjectState, writeProjectState } from '@/lib/project/storage';

describe('project storage persistence', () => {
  const setupWindow = () => {
    const store: Record<string, string> = {};
    global.window = {
      localStorage: {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        }
      }
    } as unknown as Window & typeof globalThis;
    return store;
  };

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (global as { window?: Window }).window;
  });

  it('записывает и читает последнюю вкладку проекта', () => {
    setupWindow();
    writeProjectState('DEMO', { lastTab: 'tasks' });
    const state = readProjectState('DEMO');
    expect(state.lastTab).toBe('tasks');
  });

  it('возвращает пустой объект при битых данных', () => {
    const store = setupWindow();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    store['cv-project:DEMO'] = 'не-json';
    const state = readProjectState('DEMO');
    warnSpy.mockRestore();
    expect(state).toEqual({});
  });
});
