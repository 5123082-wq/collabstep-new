import { test, expect } from '@playwright/test';
import { loginAsDemo } from './utils/auth';

const appOrigin = 'http://localhost:3000';

test.describe('sidebar flyout on touch devices', () => {
  test.use({ viewport: { width: 414, height: 896 }, hasTouch: true });

  test('opens flyout on first tap and navigates on second', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    const performersTrigger = sidebar.getByRole('link', { name: 'Исполнители' }).first();

    await performersTrigger.tap();
    const performersFlyout = sidebar.locator('[data-state="open"]').first();
    await expect(performersFlyout).toBeVisible();
    await expect(performersFlyout).toContainText('Исполнители');
    await expect(page).toHaveURL(`${appOrigin}/app/dashboard`);

    const teamsLink = performersFlyout.getByRole('link', { name: 'Команды и подрядчики' });
    await teamsLink.tap();

    await expect(page).toHaveURL(`${appOrigin}/app/performers/teams`);
    await expect(performersFlyout).toHaveCount(0);
  });

  test('closes flyout after tapping outside of the menu', async ({ page }) => {
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    const marketplaceTrigger = sidebar.getByRole('link', { name: 'Маркетплейс' }).first();

    await marketplaceTrigger.tap();
    const marketplaceFlyout = sidebar.locator('[data-state="open"]').first();
    await expect(marketplaceFlyout).toBeVisible();
    await expect(marketplaceFlyout).toContainText('Маркетплейс');

    await page.touchscreen.tap(280, 120);

    await expect(marketplaceFlyout).toHaveCount(0);
  });
});
