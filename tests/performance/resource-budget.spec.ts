import { test, expect } from '../../fixtures/test.fixture';
import { collectResourceSummary } from '../../utils/performance';
import { perfBudgets } from '../../utils/data';

/**
 * Presupuesto de recursos: controla que la página de inventario no exceda un
 * número de peticiones ni un peso total de descarga, evitando regresiones por
 * assets/scripts añadidos sin control.
 */
test.describe('Presupuesto de recursos', () => {
  test('inventario respeta el presupuesto de requests y peso', async ({
    loginAs,
    page,
  }, testInfo) => {
    await loginAs();
    await page.waitForLoadState('load');

    const summary = await collectResourceSummary(page);
    await testInfo.attach('resource-summary.json', {
      body: JSON.stringify(summary, null, 2),
      contentType: 'application/json',
    });

    const { maxRequests, maxTransferBytes } = perfBudgets.recursos;
    expect(
      summary.requestCount,
      `${summary.requestCount} requests > ${maxRequests}`,
    ).toBeLessThanOrEqual(maxRequests);
    expect(
      summary.totalTransferBytes,
      `${summary.totalTransferBytes} bytes > ${maxTransferBytes}`,
    ).toBeLessThanOrEqual(maxTransferBytes);
  });
});
