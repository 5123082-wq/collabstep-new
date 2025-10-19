import { expect, test } from '@playwright/test';
import { loginAsDemo } from './utils/auth';
import { captureConsole } from './utils/console';

const appOrigin = 'http://localhost:3000';
const placeholderText = 'Данные и виджеты будут подключаться на следующих этапах. Сейчас — демо-макет.';
const forbiddenLabel = ['Stage', '3'].join(' ');

test.describe('placeholders', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
  });

  test('отображают демо-копию вместо запрещённого этапа', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);

    await page.goto(`${appOrigin}/app/dashboard`);
    await expect(page.getByText(placeholderText)).toBeVisible();
    const dashboardHasForbidden = await page.evaluate((text) => document.body.innerText.includes(text), forbiddenLabel);
    expect(dashboardHasForbidden).toBe(false);

    await page.goto(`${appOrigin}/p/alexey-ivanov`);
    await expect(page.getByText(placeholderText)).toBeVisible();
    const profileHasForbidden = await page.evaluate((text) => document.body.innerText.includes(text), forbiddenLabel);
    expect(profileHasForbidden).toBe(false);

    expect(logs).toEqual([]);
  });
});
