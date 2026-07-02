import { test, expect } from '../../fixtures/test.fixture';

test.describe('Logout', () => {
  test('cierra la sesión y vuelve al login', async ({ loginAs, header, loginPage, page }) => {
    await loginAs();

    await header.logout();

    await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    await loginPage.expectIsVisible();
  });

  test('no permite volver al inventario tras el logout', async ({ loginAs, header, page }) => {
    await loginAs();
    await header.logout();

    await page.goto('/inventory.html');

    // SauceDemo redirige/expone error al intentar acceder sin sesión.
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
