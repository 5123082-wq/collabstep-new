import { test, expect } from '@playwright/test';
import { loginAsDemo } from './utils/auth';
import { captureConsole } from './utils/console';

const appOrigin = 'http://127.0.0.1:3000';

test.describe('demo admin smoke workflow', () => {
  test('admin can create project and task workspace items', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);

    await loginAsDemo(page, 'admin', appOrigin);

    await page.goto(`${appOrigin}/project/new`);
    await page.waitForURL('**/app/projects/create', { waitUntil: 'load' });

    const nextButton = page.getByRole('button', { name: 'Далее' });
    await nextButton.click();

    const projectName = `Admin Smoke Project ${Date.now()}`;
    await page.getByLabel('Название проекта').fill(projectName);
    await nextButton.click();

    await page.getByTestId('wizard-submit').click();
    await page.waitForURL('**/app/project/**', { timeout: 15000 });

    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    const projectUrl = page.url();
    await page.goto(`${projectUrl}/tasks`);
    await page.waitForURL('**/app/project/**/tasks', { timeout: 15000 });

    const kanbanView = page.locator('[data-view-mode="kanban"]');
    await expect(kanbanView).toBeVisible();

    const taskTitle = `Admin Smoke Task ${Date.now()}`;
    await page.getByPlaceholder('Новая задача…').fill(taskTitle);
    await page.getByRole('button', { name: 'Добавить' }).click();

    await expect(kanbanView.getByText(taskTitle)).toBeVisible({ timeout: 10000 });

    expect(logs).toEqual([]);
  });
});
