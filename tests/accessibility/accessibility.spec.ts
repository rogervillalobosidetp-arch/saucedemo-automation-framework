import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect } from '../../fixtures/test.fixture';

/**
 * Auditoría de accesibilidad con axe-core (WCAG 2.0/2.1 A y AA).
 *
 * Se aplica el patrón profesional de "baseline de deuda conocida": SauceDemo
 * tiene violaciones propias que no podemos corregir (es un tercero). En lugar de
 * fallar siempre, se documentan en KNOWN_ISSUES y la prueba falla solo ante
 * violaciones bloqueantes NUEVAS (regresiones). Todas las violaciones se
 * adjuntan al reporte para su análisis.
 */
const BLOQUEANTES = ['critical', 'serious'];

// Violaciones bloqueantes conocidas y aceptadas de SauceDemo (deuda del demo).
const KNOWN_ISSUES: Record<string, string[]> = {
  login: [],
  inventory: ['select-name'], // el <select> de ordenamiento no tiene nombre accesible
};

function analizar(page: Page) {
  return new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
}

async function auditar(page: Page, testInfo: TestInfo, baseline: string[]) {
  const results = await analizar(page);
  await testInfo.attach('a11y-violations.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const bloqueantes = results.violations.filter((v) => BLOQUEANTES.includes(v.impact ?? ''));
  // Registrar la deuda conocida como anotación visible en el reporte.
  bloqueantes
    .filter((v) => baseline.includes(v.id))
    .forEach((v) => testInfo.annotations.push({ type: 'a11y-known', description: v.id }));

  const nuevas = bloqueantes.filter((v) => !baseline.includes(v.id)).map((v) => v.id);
  return nuevas;
}

test.describe('Accesibilidad', () => {
  test('página de Login sin violaciones bloqueantes nuevas', async ({ loginPage, page }, info) => {
    await loginPage.goto();
    const nuevas = await auditar(page, info, KNOWN_ISSUES.login);
    expect(nuevas, `Violaciones bloqueantes nuevas: ${JSON.stringify(nuevas)}`).toEqual([]);
  });

  test('página de Inventario sin violaciones bloqueantes nuevas', async ({
    loginAs,
    page,
  }, info) => {
    await loginAs();
    const nuevas = await auditar(page, info, KNOWN_ISSUES.inventory);
    expect(nuevas, `Violaciones bloqueantes nuevas: ${JSON.stringify(nuevas)}`).toEqual([]);
  });

  test('contraste de color (WCAG AA)', async ({ loginPage, page }, info) => {
    await loginPage.goto();
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    const contraste = results.violations.filter((v) => v.id === 'color-contrast');
    await info.attach('a11y-contrast.json', {
      body: JSON.stringify(contraste, null, 2),
      contentType: 'application/json',
    });
    expect(contraste, 'Existen problemas de contraste de color').toEqual([]);
  });

  test('navegación básica por teclado en el login', async ({ loginPage, page }) => {
    await loginPage.goto();

    await page.keyboard.press('Tab');
    await expect(loginPage.usernameInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(loginPage.loginButton).toBeFocused();
  });
});
