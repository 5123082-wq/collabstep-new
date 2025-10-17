import type { Page } from '@playwright/test';

const DEFAULT_ORIGIN = 'http://localhost:3000';

export async function loginAsDemo(
  page: Page,
  role: 'user' | 'admin' = 'user',
  origin: string = DEFAULT_ORIGIN
): Promise<void> {
  const loginUrl = `${origin}/login`;
  await page.goto(loginUrl);
  const buttonLabel = role === 'admin' ? 'Войти демо-админом' : 'Войти демо-пользователем';
  await page.getByRole('button', { name: buttonLabel }).click();
  await page.waitForURL('**/app/dashboard');
  await page.getByTestId('role-badge').waitFor({ state: 'visible' });
}
