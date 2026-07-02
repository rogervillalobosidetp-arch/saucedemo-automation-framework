import { test, expect } from '../../fixtures/test.fixture';
import { loginCases } from '../../utils/data';

/**
 * Login — Data Driven Testing.
 * Cada escenario (éxito, bloqueado, inexistente, contraseña incorrecta,
 * campos vacíos) se ejecuta desde data/login-cases.json.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.expectIsVisible();
  });

  for (const c of loginCases) {
    test(c.caso, async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(c.username, c.password);

      if (c.esperado === 'success') {
        await inventoryPage.expectIsVisible();
        await expect(page).toHaveURL(/inventory\.html/);
      } else {
        await loginPage.expectLoginError(c.mensajeError);
        await expect(page).not.toHaveURL(/inventory\.html/);
      }
    });
  }
});
