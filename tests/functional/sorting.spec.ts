import { test, expect } from '../../fixtures/test.fixture';
import {
  isSortedAlphaAsc,
  isSortedAlphaDesc,
  isSortedAsc,
  isSortedDesc,
} from '../../utils/helpers';

test.describe('Ordenamiento del inventario', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs();
  });

  test('Nombre A → Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const nombres = await inventoryPage.getProductNames();
    expect(isSortedAlphaAsc(nombres)).toBe(true);
  });

  test('Nombre Z → A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const nombres = await inventoryPage.getProductNames();
    expect(isSortedAlphaDesc(nombres)).toBe(true);
  });

  test('Precio menor → mayor', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const precios = await inventoryPage.getProductPrices();
    expect(isSortedAsc(precios)).toBe(true);
  });

  test('Precio mayor → menor', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const precios = await inventoryPage.getProductPrices();
    expect(isSortedDesc(precios)).toBe(true);
  });
});
