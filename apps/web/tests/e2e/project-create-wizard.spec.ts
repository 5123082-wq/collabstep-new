import { test, expect } from '@playwright/test';
import { loginAsDemo } from './utils/auth';
import { captureConsole } from './utils/console';

const appOrigin = 'http://localhost:3000';

test.describe('project create wizard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page, 'user', appOrigin);
  });

  test('happy path — blank project', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);

    await page.goto(`${appOrigin}/app/projects/create`);
    const nextButton = page.getByRole('button', { name: 'Далее' });
    await expect(nextButton).toBeEnabled();

    await nextButton.click();
    const nameInput = page.getByLabel('Название проекта');
    await expect(nameInput).toBeVisible();
    await expect(nextButton).toBeDisabled();

    await nameInput.fill('Wizard Blank Project');
    await nextButton.click();

    const submitButton = page.getByTestId('wizard-submit');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await page.waitForURL('**/app/project/**', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Wizard Blank Project' })).toBeVisible();
    expect(logs).toEqual([]);
  });

  test('happy path — template project', async ({ page }) => {
    await page.goto(`${appOrigin}/app/projects/create`);
    await page.getByTestId('wizard-mode-template').click();

    const templateCard = page.getByTestId(/wizard-template-/).first();
    await templateCard.waitFor({ state: 'visible' });
    await templateCard.click();

    await page.getByRole('button', { name: 'Далее' }).click();
    const nameInput = page.getByLabel('Название проекта');
    await nameInput.fill('Wizard Template Project');
    await page.getByRole('button', { name: 'Далее' }).click();

    await page.getByTestId('wizard-submit').click();
    await page.waitForURL('**/app/project/**', { timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Wizard Template Project' })).toBeVisible();
  });

  test('validations and draft restoration', async ({ page }) => {
    await page.goto(`${appOrigin}/app/projects/create`);
    const nextButton = page.getByRole('button', { name: 'Далее' });
    await nextButton.click();

    const nameInput = page.getByLabel('Название проекта');
    await expect(nextButton).toBeDisabled();

    await nameInput.fill('Wi');
    await expect(nextButton).toBeDisabled();

    await nameInput.fill('Wizard Draft Project');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    const inviteMessage = page.getByLabel('Сообщение приглашения');
    await inviteMessage.fill('Остаётся на шаге 3');

    await page.reload();
    await page.waitForURL('**/app/projects/create', { waitUntil: 'load' });
    await expect(page.getByLabel('Название проекта')).toHaveValue('Wizard Draft Project');
    await expect(page.getByLabel('Сообщение приглашения')).toHaveValue('Остаётся на шаге 3');
    await expect(page.getByRole('button', { name: 'Создать проект' })).toBeVisible();
  });
});
