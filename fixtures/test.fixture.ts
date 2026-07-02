import { test as base, expect } from '@playwright/test';
import {
  LoginPage,
  InventoryPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  HeaderComponent,
} from '../pages';
import { env } from '../utils/env';

/**
 * Fixtures personalizadas: inyectan cada Page Object ya construido y una
 * ayuda `loginAs` para autenticar rápidamente en los tests que parten de
 * una sesión iniciada.
 */
type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: HeaderComponent;
  loginAs: (username?: string, password?: string) => Promise<InventoryPage>;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  loginAs: async ({ loginPage, inventoryPage }, use) => {
    const helper = async (
      username: string = env.users.standard,
      password: string = env.users.password,
    ): Promise<InventoryPage> => {
      await loginPage.goto();
      await loginPage.login(username, password);
      await inventoryPage.expectIsVisible();
      return inventoryPage;
    };
    await use(helper);
  },
});

export { expect };
