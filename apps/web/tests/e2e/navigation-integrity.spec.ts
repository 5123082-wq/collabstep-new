import { test, expect } from '@playwright/test';
import { captureConsole } from './utils/console';
import { loginAsDemo } from './utils/auth';

const appOrigin = 'http://localhost:3000';
const REQUIRED_SECTIONS = [
  'Маркетплейс',
  'Исполнители',
  'AI-хаб',
  'Комьюнити',
  'Финансы',
  'Документы',
  'Админка'
];

test.describe('app navigation integrity', () => {
  test('sidebar lists key sections for admin session', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await loginAsDemo(page, 'admin', appOrigin);

    const navigation = page.getByRole('navigation', { name: 'Навигация приложения' });
    await expect(navigation).toBeVisible();

    for (const label of REQUIRED_SECTIONS) {
      await expect(navigation.getByRole('link', { name: label, exact: false })).toBeVisible();
    }

    expect(logs).toEqual([]);
  });

  test('project workspace keeps global menu stable', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    const initialBox = await sidebar.boundingBox();
    expect(initialBox?.width).toBeTruthy();

    await page.goto(`${appOrigin}/project/modules`);
    await expect(page).toHaveURL(`${appOrigin}/project/modules`);

    const workspaceSidebar = page.locator('aside').first();
    const workspaceBox = await workspaceSidebar.boundingBox();
    expect(workspaceBox?.width).toBeCloseTo(initialBox!.width!, 1);

    const navigation = page.getByRole('navigation', { name: 'Навигация приложения' });
    for (const label of REQUIRED_SECTIONS) {
      await expect(navigation.getByRole('link', { name: label, exact: false })).toBeVisible();
    }

    expect(logs).toEqual([]);
  });

  test('overlays and rail do not affect sidebar layout', async ({ page }) => {
    const logs: string[] = [];
    captureConsole(page, logs);
    await loginAsDemo(page, 'admin', appOrigin);

    const sidebar = page.locator('aside').first();
    const navigation = page.getByRole('navigation', { name: 'Навигация приложения' });
    const initialBox = await sidebar.boundingBox();
    expect(initialBox?.width).toBeTruthy();

    await page.getByRole('button', { name: 'Создать' }).click();
    await expect(page.getByRole('dialog', { name: 'Меню создания' })).toBeVisible();
    const withCreateBox = await sidebar.boundingBox();
    expect(withCreateBox?.width).toBeCloseTo(initialBox!.width!, 1);
    await page.keyboard.press('Escape');

    await page.keyboard.press('Control+K');
    await expect(page.getByRole('dialog', { name: 'Командная палитра' })).toBeVisible();
    const withPaletteBox = await sidebar.boundingBox();
    expect(withPaletteBox?.width).toBeCloseTo(initialBox!.width!, 1);
    await page.keyboard.press('Escape');

    const railButton = page.locator('aside[data-expanded] button').first();
    await railButton.focus();
    await page.waitForTimeout(200);
    const withRailBox = await sidebar.boundingBox();
    expect(withRailBox?.width).toBeCloseTo(initialBox!.width!, 1);

    await expect(navigation.getByRole('link', { name: 'Маркетплейс', exact: false })).toBeVisible();
    expect(logs).toEqual([]);
  });
});
