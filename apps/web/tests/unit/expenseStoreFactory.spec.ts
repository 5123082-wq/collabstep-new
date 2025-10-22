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
    process.env.FIN_EXPENSES_STORAGE = ORIGINAL_ENV.FIN_EXPENSES_STORAGE ?? '';
    process.env.NODE_ENV = ORIGINAL_ENV.NODE_ENV ?? 'test';
    process.env.VERCEL_ENV = ORIGINAL_ENV.VERCEL_ENV ?? '';
  });

  afterAll(() => {
    resetExpenseStore();
    setDbExpenseStoreDependenciesFactory(null);
    process.env.FIN_EXPENSES_STORAGE = ORIGINAL_ENV.FIN_EXPENSES_STORAGE;
    process.env.NODE_ENV = ORIGINAL_ENV.NODE_ENV;
    process.env.VERCEL_ENV = ORIGINAL_ENV.VERCEL_ENV;
  });

  it('resolves memory store when FIN_EXPENSES_STORAGE=memory', () => {
    process.env.FIN_EXPENSES_STORAGE = 'memory';
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(MemoryExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('memory');
    expect(getCachedExpenseStoreDriver()).toBe('memory');
  });

  it('resolves db store when FIN_EXPENSES_STORAGE=db and dependencies provided', () => {
    process.env.FIN_EXPENSES_STORAGE = 'db';
    setDbExpenseStoreDependenciesFactory(() => createDbDependencies());
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(DbExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('db');
    expect(getCachedExpenseStoreDriver()).toBe('db');
  });

  it('defaults to db store in production environments', () => {
    process.env.FIN_EXPENSES_STORAGE = '';
    process.env.NODE_ENV = 'production';
    setDbExpenseStoreDependenciesFactory(() => createDbDependencies());
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(DbExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('db');
  });

  it('defaults to memory store outside prod/staging', () => {
    process.env.FIN_EXPENSES_STORAGE = '';
    process.env.NODE_ENV = 'development';
    process.env.VERCEL_ENV = '';
    resetExpenseStore();

    const store = getExpenseStore();
    expect(store).toBeInstanceOf(MemoryExpenseStore);
    expect(resolveExpenseStoreDriver()).toBe('memory');
  });
});
