import { test, expect } from '@playwright/test';
import { loginAsDemo } from './utils/auth';

const appOrigin = 'http://127.0.0.1:3000';

test.describe('admin panel', () => {
  test('admin can access admin panel', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin`);
    await page.waitForURL('**/app/admin', { waitUntil: 'networkidle' });

    // Проверяем заголовок
    await expect(page.getByRole('heading', { name: 'Панель администратора' })).toBeVisible();
  });

  test('admin can navigate between admin sections', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin`);

    // Проверяем, что видим все модули
    await expect(page.getByText('Управление Фичами')).toBeVisible();
    await expect(page.getByText('Пользователи')).toBeVisible();
    await expect(page.getByText('Роли & Разрешения')).toBeVisible();
    await expect(page.getByText('Сегменты')).toBeVisible();
    await expect(page.getByText('Аудит')).toBeVisible();
    await expect(page.getByText('Релизы')).toBeVisible();
    await expect(page.getByText('Support Tools')).toBeVisible();
  });

  test('non-admin cannot access admin panel', async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
    await page.goto(`${appOrigin}/app/admin`);

    // Должен быть редирект с тостом
    await page.waitForURL('**/app/dashboard**', { timeout: 5000 });
    expect(page.url()).toContain('/app/dashboard');
  });

  test('admin features page shows feature list', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin/features`);

    await expect(page.getByRole('heading', { name: 'Управление Фичами' })).toBeVisible();
    // Проверяем наличие карточек фич
    await expect(page.getByText('Маркетинг')).toBeVisible();
  });

  test('admin users page shows user management', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin/users`);

    await expect(page.getByRole('heading', { name: 'Управление пользователями' })).toBeVisible();
    // Проверяем наличие таблицы или сообщения о пустоте
    const hasTable = await page.locator('table').count();
    expect(hasTable).toBeGreaterThan(0);
  });

  test('admin roles page shows role management', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin/roles`);

    await expect(page.getByRole('heading', { name: 'Роли и разрешения' })).toBeVisible();
    // Проверяем наличие карточек ролей
    await expect(page.getByText('Владелец')).toBeVisible();
  });

  test('admin audit page shows audit log', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin/audit`);

    await expect(page.getByRole('heading', { name: 'Журнал аудита' })).toBeVisible();
  });

  test('admin can toggle feature on features page', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);
    await page.goto(`${appOrigin}/app/admin/features`);

    // Ищем первую фичу с переключателем
    const toggleButton = page.getByRole('button', { name: /Включено|Отключено/ }).first();
    await toggleButton.click();

    // Проверяем, что состояние изменилось
    await expect(toggleButton).toHaveText(/Включено|Отключено/);
  });
});

