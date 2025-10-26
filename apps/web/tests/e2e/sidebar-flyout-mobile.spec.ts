import { expect, test } from '@playwright/test';
import { captureConsole } from './utils/console';
import { loginAsDemo } from './utils/auth';

const appOrigin = 'http://localhost:3000';

test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true });

test.describe('collapsed sidebar flyout on touch viewports', () => {

  test('tap opens flyout and keeps it stable while moving towards submenu', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    const collapsedNav = page.getByRole('navigation', { name: 'Свёрнутая навигация приложения' });
    const marketplaceTrigger = collapsedNav.getByRole('link', { name: 'Маркетплейс', exact: false }).first();

    const urlBefore = page.url();
    await marketplaceTrigger.tap();
    await expect(page).toHaveURL(urlBefore);
    await expect(marketplaceTrigger).toHaveAttribute('aria-expanded', 'true');

    const flyout = sidebar.locator('[data-flyout="marketplace"]');
    await expect(flyout).toHaveAttribute('aria-hidden', 'false');
    const catalogLink = flyout.getByRole('link', { name: 'Каталог шаблонов', exact: false }).first();
    await expect(catalogLink).toBeVisible();
    await expect(catalogLink).toBeEnabled();
    expect(logs).toEqual([]);
  });

  test('tapping outside the menu closes the flyout without navigating', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');

    const collapsedNav = page.getByRole('navigation', { name: 'Свёрнутая навигация приложения' });
    const marketplaceTrigger = collapsedNav.getByRole('link', { name: 'Маркетплейс', exact: false }).first();

    await marketplaceTrigger.tap();
    const flyout = sidebar.locator('[data-flyout="marketplace"]');
    await expect(flyout).toHaveAttribute('aria-hidden', 'false');

    const main = page.getByRole('main');
    await main.tap({ position: { x: 220, y: 220 } });

    await expect(flyout).toHaveAttribute('aria-hidden', 'true');
    await expect(marketplaceTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(logs).toEqual([]);
  });
});
