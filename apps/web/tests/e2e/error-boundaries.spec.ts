import { expect, test } from '@playwright/test';

import { captureConsoleMessages } from './utils/console';

const appOrigin = 'http://localhost:3000';

test.describe('error boundaries and warnings', () => {
  test('unknown project shows scoped 404 UI', async ({ page }) => {
    const logs: string[] = [];
    captureConsoleMessages(page, logs);
    const response = await page.goto(`${appOrigin}/project/UNKNOWN/overview`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /Страница не найдена/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'К проектам' })).toBeVisible();
    expect(logs).toEqual([]);
  });

  test('analytics failure triggers error boundary and retry', async ({ page }) => {
    const logs: string[] = [];
    captureConsoleMessages(page, logs);
    const response = await page.goto(`${appOrigin}/project/DEMO/analytics?fail=1`);
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/Не удалось открыть проект/i)).toBeVisible();
    const retryButton = page.getByRole('button', { name: 'Повторить попытку' });
    logs.length = 0;
    await retryButton.click();
    await expect(page).toHaveURL(`${appOrigin}/project/DEMO/overview`);
    await expect(page.getByRole('heading', { level: 1, name: 'Демо-проект' })).toBeVisible();
    expect(logs).toEqual([]);
  });

  test('homepage has no console warnings', async ({ page }) => {
    const logs: string[] = [];
    captureConsoleMessages(page, logs);
    const response = await page.goto(`${appOrigin}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    expect(logs).toEqual([]);
  });

  test('dashboard has no console warnings', async ({ page }) => {
    const logs: string[] = [];
    captureConsoleMessages(page, logs);
    const response = await page.goto(`${appOrigin}/app/dashboard`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(logs).toEqual([]);
  });
});
