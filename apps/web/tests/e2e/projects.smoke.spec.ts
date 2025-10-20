import { test, expect } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3000';

test('create project -> open -> add task', async ({ page }) => {
  await page.goto(`${appOrigin}/project/new`);
  await page.getByLabel('Название').fill('Demo CRM Project');
  await page.getByRole('button', { name: 'Создать проект' }).click();

  await expect(page.getByRole('heading', { name: 'Demo CRM Project' })).toBeVisible();
  await page.getByRole('link', { name: 'Задачи' }).click();
  await page.waitForURL('**/project/**/tasks');
  await page.getByPlaceholder('Новая задача…').fill('Первая задача');
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByText('Первая задача')).toBeVisible();
});
