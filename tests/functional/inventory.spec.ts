import { test, expect } from '../../fixtures/test.fixture';
import { products } from '../../utils/data';

test.describe('Inventario', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs();
  });

  test('muestra los 6 productos esperados', async ({ inventoryPage }) => {
    await expect(inventoryPage.inventoryItems).toHaveCount(products.totalEsperado);
  });

  test('valida nombres de todos los productos', async ({ inventoryPage }) => {
    const nombres = await inventoryPage.getProductNames();
    for (const p of products.esperados) {
      expect(nombres).toContain(p.nombre);
    }
  });

  test('valida precios de todos los productos', async ({ inventoryPage }) => {
    for (const p of products.esperados) {
      expect(await inventoryPage.getPrice(p.nombre)).toBe(p.precio);
    }
  });

  test('cada producto tiene imagen con src válido', async ({ inventoryPage }) => {
    const total = await inventoryPage.count();
    await expect(inventoryPage.itemImages).toHaveCount(total);

    const sources = await inventoryPage.getImageSources();
    for (const src of sources) {
      expect(src).toBeTruthy();
      expect(src).not.toContain('sl-404'); // imagen rota de problem_user
    }
  });

  test('cada producto tiene botón Add To Cart', async ({ inventoryPage }) => {
    const total = await inventoryPage.count();
    await expect(inventoryPage.addToCartButtons).toHaveCount(total);
  });
});
