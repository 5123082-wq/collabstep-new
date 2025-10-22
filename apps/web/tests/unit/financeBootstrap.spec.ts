import type { Expense } from '@collabverse/api/types';

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

async function importStoreFactory() {
  return import('@collabverse/api/stores/expense-store-factory');
}

describe('finance bootstrap', () => {
  afterEach(() => {
    setEnv('FIN_EXPENSES_STORAGE', ORIGINAL_ENV.FIN_EXPENSES_STORAGE);
    setEnv('NODE_ENV', ORIGINAL_ENV.NODE_ENV);
    setEnv('VERCEL_ENV', ORIGINAL_ENV.VERCEL_ENV);
  });

  it('configures db dependencies when driver resolves to db', async () => {
    setEnv('FIN_EXPENSES_STORAGE', 'db');
    setEnv('NODE_ENV', 'test');

    jest.resetModules();

    const { resetFinanceDb } = await import('@/lib/finance/db-dependencies');
    resetFinanceDb();

    const storeFactory = await importStoreFactory();
    storeFactory.resetExpenseStore();
    storeFactory.setDbExpenseStoreDependenciesFactory(null);

    await import('@/lib/finance/bootstrap');

    const { DbExpenseStore } = await import('@collabverse/api/repositories/expense-store');
    const store = storeFactory.getExpenseStore();
    expect(store).toBeInstanceOf(DbExpenseStore);

    const expense: Expense = {
      id: 'exp-db-test',
      workspaceId: 'ws-demo',
      projectId: 'project-demo',
      date: new Date().toISOString(),
      amount: '123.45',
      currency: 'USD',
      category: 'Travel',
      status: 'draft',
      createdBy: 'tester@collabverse.test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await store.create({ expense, actorId: 'tester' });
    expect(created).toEqual(expect.objectContaining({ id: expense.id, amount: expense.amount }));

    const listed = await store.list({ projectId: expense.projectId });
    expect(listed.map((item) => item.id)).toContain(expense.id);

    const aggregated = await store.aggregateByCategory({
      projectId: expense.projectId,
      statuses: ['draft']
    });
    expect(aggregated.get('travel')).toBe(12345n);
  });

  it('uses db driver by default in production builds', async () => {
    setEnv('FIN_EXPENSES_STORAGE', undefined);
    setEnv('NODE_ENV', 'production');
    setEnv('VERCEL_ENV', '');

    jest.resetModules();

    const { resetFinanceDb } = await import('@/lib/finance/db-dependencies');
    resetFinanceDb();

    const storeFactory = await importStoreFactory();
    storeFactory.resetExpenseStore();
    storeFactory.setDbExpenseStoreDependenciesFactory(null);

    await import('@/lib/finance/bootstrap');

    const { resolveExpenseStoreDriver, getExpenseStore } = await importStoreFactory();
    const { DbExpenseStore } = await import('@collabverse/api/repositories/expense-store');

    expect(resolveExpenseStoreDriver()).toBe('db');
    expect(getExpenseStore()).toBeInstanceOf(DbExpenseStore);
  });
});
