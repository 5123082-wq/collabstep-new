import { test, expect, type Page } from '@playwright/test';
import { captureConsole } from './utils/console';

const baseUrl = 'http://localhost:3000';

async function performDemoLogin(page: Page, role: 'user' | 'admin') {
  const logs: string[] = [];
  captureConsole(page, logs);
  await page.goto(`${baseUrl}/login`);
  const buttonLabel = role === 'admin' ? 'Войти демо-админом' : 'Войти демо-пользователем';
  await page.getByRole('button', { name: buttonLabel }).click();
  await page.waitForURL('**/app/dashboard');
  await expect(page.getByTestId('role-badge')).toHaveText(role === 'admin' ? 'Админ' : 'Пользователь');
  expect(logs).toEqual([]);
}

test('login-success', async ({ page }) => {
  await performDemoLogin(page, 'user');
});

test('login-admin-access', async ({ page }) => {
  await performDemoLogin(page, 'admin');
  const response = await page.goto(`${baseUrl}/app/admin`);
  expect(response?.status()).toBe(200);
});
