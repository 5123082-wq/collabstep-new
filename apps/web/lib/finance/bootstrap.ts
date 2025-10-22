import { createDbExpenseStoreDependencies } from '@/lib/finance/db-dependencies';
import { resolveExpenseStoreDriver, setDbExpenseStoreDependenciesFactory } from '@collabverse/api/stores/expense-store-factory';

let initialized = false;

function configureExpenseStore(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  const driver = resolveExpenseStoreDriver();
  if (driver !== 'db') {
    return;
  }

  setDbExpenseStoreDependenciesFactory(() => createDbExpenseStoreDependencies());
}

configureExpenseStore();
