import { test, expect } from '../../fixtures/test.fixture';
import { checkoutCases, products } from '../../utils/data';
import { round2, sum } from '../../utils/helpers';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginAs, inventoryPage }) => {
    await loginAs();
    for (const nombre of products.carritoMultiple) {
      await inventoryPage.addToCart(nombre);
    }
    await inventoryPage.goToCart();
  });

  test('flujo completo de compra exitoso', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo('Rodrigo', 'Villalobos', '28001');
    await checkoutPage.expectOverviewIsVisible();
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test.describe('validaciones de campos obligatorios (DDT)', () => {
    for (const c of checkoutCases) {
      test(c.caso, async ({ cartPage, checkoutPage }) => {
        await cartPage.checkout();
        await checkoutPage.fillCustomerInfo(
          c.cliente.firstName ?? '',
          c.cliente.lastName ?? '',
          c.cliente.postalCode ?? '',
        );

        if (c.esperado === 'success') {
          await checkoutPage.expectOverviewIsVisible();
        } else {
          await checkoutPage.expectValidationError(c.mensajeError);
        }
      });
    }
  });

  test('el resumen contiene los productos del carrito', async ({ cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo('Rodrigo', 'Villalobos', '28001');

    const nombres = await checkoutPage.getOverviewItemNames();
    for (const nombre of products.carritoMultiple) {
      expect(nombres).toContain(nombre);
    }
  });

  test('impuesto y total se calculan correctamente (Total = Subtotal + Impuestos)', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.checkout();
    await checkoutPage.fillCustomerInfo('Rodrigo', 'Villalobos', '28001');
    await checkoutPage.expectOverviewIsVisible();

    const preciosItems = await checkoutPage.getOverviewItemPrices();
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();

    // El subtotal debe ser la suma de los ítems.
    expect(subtotal).toBe(sum(preciosItems));

    // El impuesto de SauceDemo es 8% del subtotal.
    expect(tax).toBe(round2(subtotal * 0.08));

    // El total debe ser subtotal + impuestos (cálculo dinámico).
    expect(total).toBe(round2(subtotal + tax));
  });
});
