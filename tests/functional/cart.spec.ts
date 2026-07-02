import { test, expect } from '../../fixtures/test.fixture';
import { products } from '../../utils/data';

test.describe('Carrito', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs();
  });

  test('agregar un producto actualiza el badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.expectCartCount(1);
  });

  test('agregar múltiples productos', async ({ inventoryPage, cartPage }) => {
    for (const nombre of products.carritoMultiple) {
      await inventoryPage.addToCart(nombre);
    }
    await inventoryPage.expectCartCount(products.carritoMultiple.length);

    await inventoryPage.goToCart();
    await cartPage.expectIsVisible();
    for (const nombre of products.carritoMultiple) {
      await cartPage.expectItemInCart(nombre);
    }
  });

  test('eliminar un producto desde el carrito', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Bike Light');
    await inventoryPage.goToCart();

    await cartPage.removeItem('Sauce Labs Backpack');

    await cartPage.expectItemNotInCart('Sauce Labs Backpack');
    await cartPage.expectItemInCart('Sauce Labs Bike Light');
    expect(await cartPage.count()).toBe(1);
  });

  test('vaciar el carrito por completo', async ({ inventoryPage, cartPage }) => {
    for (const nombre of products.carritoMultiple) {
      await inventoryPage.addToCart(nombre);
    }
    await inventoryPage.goToCart();

    for (const nombre of products.carritoMultiple) {
      await cartPage.removeItem(nombre);
    }
    await cartPage.expectEmpty();
  });

  test('el contador persiste al navegar entre páginas', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.addToCart('Sauce Labs Onesie');
    await inventoryPage.expectCartCount(2);

    await inventoryPage.goToCart();
    await cartPage.expectIsVisible();
    await cartPage.continueShopping();

    // Tras volver al inventario el contador se mantiene.
    await inventoryPage.expectCartCount(2);
  });
});
