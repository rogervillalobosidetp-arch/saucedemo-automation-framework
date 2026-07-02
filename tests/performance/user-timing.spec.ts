import { test, expect } from '../../fixtures/test.fixture';
import type { Page } from '@playwright/test';
import { measure } from '../../utils/performance';
import { perfBudgets } from '../../utils/data';
import { env } from '../../utils/env';

/**
 * Tiempos de interacción de usuario (client-side) y comparativa entre el usuario
 * estándar y `performance_glitch_user` (usuario lento intencional de SauceDemo),
 * que demuestra que el framework detecta degradación de rendimiento.
 */
async function measureLogin(page: Page, user: string): Promise<number> {
  await page.context().clearCookies();
  await page.goto('/');
  return measure(async () => {
    await page.locator('#user-name').fill(user);
    await page.locator('#password').fill(env.users.password);
    await page.locator('#login-button').click();
    await page.locator('.inventory_list').waitFor({ state: 'visible' });
  });
}

test.describe('Timing de interacciones', () => {
  test('login → render de inventario dentro del presupuesto', async ({ page }, testInfo) => {
    const ms = await measureLogin(page, env.users.standard);
    testInfo.annotations.push({ type: 'timing', description: `login->inventario: ${ms}ms` });
    expect(ms, `login->inventario ${ms}ms`).toBeLessThanOrEqual(
      perfBudgets.acciones.loginToInventory,
    );
  });

  test('agregar al carrito responde rápido', async ({ loginAs, inventoryPage }, testInfo) => {
    await loginAs();
    const ms = await measure(async () => {
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.expectCartCount(1);
    });
    testInfo.annotations.push({ type: 'timing', description: `add-to-cart: ${ms}ms` });
    expect(ms, `add-to-cart ${ms}ms`).toBeLessThanOrEqual(perfBudgets.acciones.addToCart);
  });

  test('ordenar productos responde rápido', async ({ loginAs, inventoryPage }, testInfo) => {
    await loginAs();
    const ms = await measure(async () => {
      await inventoryPage.sortBy('hilo');
      await expect(inventoryPage.itemPrices.first()).toBeVisible();
    });
    testInfo.annotations.push({ type: 'timing', description: `sort: ${ms}ms` });
    expect(ms, `sort ${ms}ms`).toBeLessThanOrEqual(perfBudgets.acciones.sort);
  });
});

test.describe('Comparativa de rendimiento por usuario', () => {
  test('performance_glitch_user es más lento que standard_user', async ({ page }, testInfo) => {
    test.setTimeout(60_000);
    const standardMs = await measureLogin(page, env.users.standard);
    const glitchMs = await measureLogin(page, env.users.performance);

    testInfo.annotations.push({
      type: 'timing-compare',
      description: `standard: ${standardMs}ms | glitch: ${glitchMs}ms | delta: ${glitchMs - standardMs}ms`,
    });

    // El usuario "glitch" incorpora una demora artificial notable en la carga.
    expect(
      glitchMs,
      `glitch (${glitchMs}ms) debería ser más lento que standard (${standardMs}ms)`,
    ).toBeGreaterThan(standardMs);
  });
});
