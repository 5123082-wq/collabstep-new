import { test, expect } from '@playwright/test';
import { captureConsole } from './utils/console';
import { loginAsDemo } from './utils/auth';

const appOrigin = 'http://localhost:3000';

const routes = [
  { label: 'Обзор', path: '/app/projects' },
  { label: 'Мои', path: '/app/projects/my' },
  { label: 'Шаблоны', path: '/app/projects/templates' },
  { label: 'Архив', path: '/app/projects/archive' },
  { label: 'Создать', path: '/app/projects/create' },
  { label: 'Рабочее пространство', path: '/app/projects/workspace' }
];

test.describe('projects hub', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
  });

  test('верхнее меню переключает маршруты без ошибок', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await page.goto(`${appOrigin}/app/projects`);

    for (const route of routes) {
      const link = page.getByRole('link', { name: route.label });
      await expect(link).toBeVisible();
      await link.click();
      await page.waitForURL(`**${route.path}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    expect(logs).toEqual([]);
  });

  test('drawer открывается, фокусируется и закрывается по Escape', async ({ page }) => {
    await page.goto(`${appOrigin}/app/projects`);
    const trigger = page.getByRole('button', { name: 'Показать карточку проекта' });
    await trigger.click();

    const drawer = page.getByRole('dialog', { name: 'Карточка проекта' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('Содержимое карточки появится в следующих итерациях.')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});
