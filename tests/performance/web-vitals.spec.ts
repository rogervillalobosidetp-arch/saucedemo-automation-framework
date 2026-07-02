import { test, expect } from '../../fixtures/test.fixture';
import type { TestInfo } from '@playwright/test';
import { collectNavMetrics, type NavMetrics } from '../../utils/performance';
import { perfBudgets, type PageBudget } from '../../utils/data';

/**
 * Métricas reales de navegación (Navigation Timing + Paint API), más
 * deterministas que Lighthouse y sin dependencias externas. Se validan contra
 * los presupuestos de data/performance-budgets.json.
 */
async function assertBudget(
  testInfo: TestInfo,
  metrics: NavMetrics,
  budget: PageBudget,
): Promise<void> {
  await testInfo.attach('nav-metrics.json', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });

  expect(metrics.ttfb, `TTFB ${metrics.ttfb}ms > ${budget.ttfb}ms`).toBeLessThanOrEqual(
    budget.ttfb,
  );
  expect(
    metrics.domContentLoaded,
    `DOMContentLoaded ${metrics.domContentLoaded}ms > ${budget.domContentLoaded}ms`,
  ).toBeLessThanOrEqual(budget.domContentLoaded);
  expect(metrics.load, `Load ${metrics.load}ms > ${budget.load}ms`).toBeLessThanOrEqual(
    budget.load,
  );
  if (metrics.firstContentfulPaint !== null) {
    expect(
      metrics.firstContentfulPaint,
      `FCP ${metrics.firstContentfulPaint}ms > ${budget.firstContentfulPaint}ms`,
    ).toBeLessThanOrEqual(budget.firstContentfulPaint);
  }
}

test.describe('Web Vitals / Navigation Timing', () => {
  test('página de Login dentro del presupuesto', async ({ loginPage, page }, testInfo) => {
    await loginPage.goto();
    await page.waitForLoadState('load');
    const metrics = await collectNavMetrics(page);
    await assertBudget(testInfo, metrics, perfBudgets.paginas.login);
  });

  test('página de Inventario dentro del presupuesto', async ({ loginAs, page }, testInfo) => {
    await loginAs();
    await page.waitForLoadState('load');
    const metrics = await collectNavMetrics(page);
    await assertBudget(testInfo, metrics, perfBudgets.paginas.inventory);
  });
});
