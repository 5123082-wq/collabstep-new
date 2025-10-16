import { test, expect } from '@playwright/test';
import { captureConsole } from './utils/console';

const marketingOrigin = 'http://localhost:3000';

test.describe('marketing mega menu', () => {
  test('focus opens menu and navigation works', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await page.goto(`${marketingOrigin}/`);
    const desktopNav = page.locator('nav[aria-label="Основная навигация"]');
    await expect(desktopNav).toHaveAttribute('data-menu-ready', 'true');
    const productButton = page.getByRole('button', { name: 'Продукт' });
    await expect(productButton).toHaveAttribute('aria-expanded', 'false');
    await productButton.focus();
    await expect(productButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mega-product')).toBeVisible();
    await page.locator('#mega-product').getByRole('menuitem', { name: 'Обзор платформы' }).click();
    await page.waitForURL('**/product');
    await expect(page.getByRole('heading', { name: 'Обзор платформы' })).toBeVisible();
    expect(logs).toEqual([]);
  });
});
