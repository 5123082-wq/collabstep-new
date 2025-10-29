import { test, expect } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3000';

test('create project -> open tasks workspace', async ({ page }) => {
  await page.goto(`${appOrigin}/project/new`);
  await page.getByLabel('Название').fill('Demo CRM Project');
  await page.getByRole('button', { name: 'Создать проект' }).click();

  await expect(page.getByRole('heading', { name: 'Demo CRM Project' })).toBeVisible();
  await page.getByRole('link', { name: 'Задачи' }).click();
  await page.waitForURL('**/project/**/tasks');
  await expect(page.locator('[data-view-mode="kanban"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Список' })).toBeVisible();
  await page.getByRole('button', { name: 'Список' }).click();
  await expect(page.locator('[data-view-mode="list"]')).toBeVisible();
  await expect(page.getByText('Задачи не найдены')).toBeVisible();
});
