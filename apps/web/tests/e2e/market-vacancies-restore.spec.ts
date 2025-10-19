import { expect, test } from '@playwright/test';
import { loginAsDemo } from './utils/auth';
import { captureConsole } from './utils/console';

const appOrigin = 'http://localhost:3000';

test.describe('marketplace vacancies restore', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
  });

  test('сбрасывает фильтры и очищает query-параметры', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);

    await page.goto(`${appOrigin}/app/marketplace/vacancies`);
    await expect(page.locator('[data-page-ready="true"]')).toBeVisible();

    const searchInput = page.getByLabel('Поиск');
    await searchInput.fill('Go');

    await expect(page).toHaveURL(/q=Go/);
    await expect(page.getByRole('article').first()).toContainText('разработчик (Go)');

    await page.getByRole('button', { name: 'Сбросить фильтры' }).click();

    await expect(page).toHaveURL(`${appOrigin}/app/marketplace/vacancies`);
    await expect(searchInput).toHaveValue('');
    await expect(page.getByRole('article').first()).toContainText('Продуктовый дизайнер');

    expect(logs).toEqual([]);
  });
});
