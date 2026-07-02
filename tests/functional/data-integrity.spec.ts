import { test, expect } from '../../fixtures/test.fixture';
import { products } from '../../utils/data';
import { sum } from '../../utils/helpers';

/**
 * Integridad de datos de precios a lo largo de todo el flujo:
 *   inventario === detalle === carrito === checkout
 * y validación de que Total = Subtotal + Impuestos.
 */
test.describe('Integridad de datos', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs();
  });

  test('precio en inventario = precio en detalle (todos los productos)', async ({
    inventoryPage,
    productDetailPage,
  }) => {
    for (const p of products.esperados) {
      const precioInventario = await inventoryPage.getPrice(p.nombre);
      await inventoryPage.openProduct(p.nombre);
      await productDetailPage.expectIsVisible();

      expect(await productDetailPage.getName()).toBe(p.nombre);
      expect(await productDetailPage.getPrice()).toBe(precioInventario);

      await productDetailPage.goBack();
      await inventoryPage.expectIsVisible();
    }
  });

  test('precio se mantiene detalle → carrito → checkout', async ({
    inventoryPage,
    productDetailPage,
    cartPage,
    checkoutPage,
  }) => {
    const preciosDetalle: Record<string, number> = {};

    // Detalle: capturar precio y agregar al carrito desde el detalle.
    for (const nombre of products.carritoMultiple) {
      await inventoryPage.openProduct(nombre);
      await productDetailPage.expectIsVisible();
      preciosDetalle[nombre] = await productDetailPage.getPrice();
      await productDetailPage.addToCartButton.click();
      await productDetailPage.goBack();
    }

    // Carrito: cada precio debe coincidir con el del detalle.
    await inventoryPage.goToCart();
    await cartPage.expectIsVisible();
    for (const nombre of products.carritoMultiple) {
      expect(await cartPage.getItemPrice(nombre)).toBe(preciosDetalle[nombre]);
    }

    // Checkout: los precios del resumen deben coincidir con los del carrito.
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo('Rodrigo', 'Villalobos', '28001');
    await checkoutPage.expectOverviewIsVisible();

    const preciosCheckout = await checkoutPage.getOverviewItemPrices();
    const esperados = products.carritoMultiple.map((n) => preciosDetalle[n]).sort((a, b) => a - b);
    expect([...preciosCheckout].sort((a, b) => a - b)).toEqual(esperados);

    // Total = Subtotal + Impuestos.
    const subtotal = await checkoutPage.getSubtotal();
    const total = await checkoutPage.getTotal();
    const tax = await checkoutPage.getTax();
    expect(subtotal).toBe(sum(preciosCheckout));
    expect(total).toBe(sum([subtotal, tax]));
  });
});
