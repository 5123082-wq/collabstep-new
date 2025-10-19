import { expect, test } from '@playwright/test';
import { loginAsDemo } from './utils/auth';
import { captureConsole } from './utils/console';

const appOrigin = 'http://localhost:3000';

test.describe('marketplace specialists empty state', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
  });

  test('показывает пустое состояние при отсутствии результатов', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);

    await page.goto(`${appOrigin}/app/marketplace/specialists`);
    await expect(page.locator('[data-page-ready="true"]')).toBeVisible();

    const minRateInput = page.getByPlaceholder('от').first();
    await minRateInput.fill('100000');
    await minRateInput.blur();

    await expect(page).toHaveURL(/rateMin=100000/);
    await expect(page.getByText('Ничего не найдено. Измените фильтры.')).toBeVisible();

    expect(logs).toEqual([]);
  });
});
