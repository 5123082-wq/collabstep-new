import {
  DbExpenseStore,
  MemoryExpenseStore,
  getCachedExpenseStoreDriver,
  getExpenseStore,
  resetExpenseStore,
  resolveExpenseStoreDriver,
  setDbExpenseStoreDependenciesFactory,
  type DbExpenseStoreDependencies,
  type ExpenseEntityRepository,
  type ExpenseIdempotencyRepository
} from '@collabverse/api';

const ORIGINAL_ENV = {
  FIN_EXPENSES_STORAGE: process.env.FIN_EXPENSES_STORAGE,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV
};

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, key);
    return;
  }
  Reflect.set(process.env, key, value);
}

function createDbDependencies(): DbExpenseStoreDependencies {
  const expenseRepo: ExpenseEntityRepository = {
    create: ({ data }) => data,
    findById: () => null,
    list: () => [],
    update: () => null,
    updateStatus: () => null,
    aggregateByCategory: () => []
  };

  const idempotencyRepo: ExpenseIdempotencyRepository = {
    get: () => null,
    set: () => {}
  };

  return { expenses: expenseRepo, idempotency: idempotencyRepo };
}

describe('expense-store factory', () => {
  beforeEach(() => {
    resetExpenseStore();
    setDbExpenseStoreDependenciesFactory(null);
    setEnv('FIN_EXPENSES_STORAGE', ORIGINAL_ENV.FIN_EXPENSES_STORAGE ?? '');
    setEnv('NODE_ENV', ORIGINAL_ENV.NODE_ENV ?? 'test');
    setEnv('VERCEL_ENV', ORIGINAL_ENV.VERCEL_ENV ?? '');
  });

  afterAll(() => {
    resetExpenseStore();
    setDbExpenseStoreDependenciesFactory(null);
    setEnv('FIN_EXPENSES_STORAGE', ORIGINAL_ENV.FIN_EXPENSES_STORAGE);
    setEnv('NODE_ENV', ORIGINAL_ENV.NODE_ENV);
    setEnv('VERCEL_ENV', ORIGINAL_ENV.VERCEL_ENV);
  });

  it('resolves memory store when FIN_EXPENSES_STORAGE=memory', () => {
    setEnv('FIN_EXPENSES_STORAGE', 'memory');
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(MemoryExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('memory');
    expect(getCachedExpenseStoreDriver()).toBe('memory');
  });

  it('resolves db store when FIN_EXPENSES_STORAGE=db and dependencies provided', () => {
    setEnv('FIN_EXPENSES_STORAGE', 'db');
    setDbExpenseStoreDependenciesFactory(() => createDbDependencies());
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(DbExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('db');
    expect(getCachedExpenseStoreDriver()).toBe('db');
  });

  it('defaults to db store in production environments', () => {
    setEnv('FIN_EXPENSES_STORAGE', '');
    setEnv('NODE_ENV', 'production');
    setDbExpenseStoreDependenciesFactory(() => createDbDependencies());
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(DbExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('db');
  });

  it('defaults to memory store outside prod/staging', () => {
    setEnv('FIN_EXPENSES_STORAGE', '');
    setEnv('NODE_ENV', 'development');
    setEnv('VERCEL_ENV', '');
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(MemoryExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('memory');
  });
});
