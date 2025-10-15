import { test, expect } from '@playwright/test';

test('главная открывается без ошибок', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('http://localhost:3000/');
  await expect(page.locator('h1')).toHaveText(/Collabverse — Stage 0/i);
  expect(errors).toEqual([]);
});
