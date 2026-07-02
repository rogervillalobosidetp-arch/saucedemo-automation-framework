import { expect, Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async expectIsVisible() {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  cartItem(name: string): Locator {
    return this.cartItems.filter({ hasText: name });
  }

  async expectItemInCart(name: string) {
    await expect(this.cartItem(name)).toBeVisible();
  }

  async expectItemNotInCart(name: string) {
    await expect(this.cartItem(name)).toHaveCount(0);
  }

  async expectEmpty() {
    await expect(this.cartItems).toHaveCount(0);
  }

  async removeItem(name: string) {
    await this.cartItem(name)
      .getByRole('button', { name: /remove/i })
      .click();
  }

  async getItemPrice(name: string): Promise<number> {
    const text = await this.cartItem(name).locator('.inventory_item_price').innerText();
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async count(): Promise<number> {
    return this.cartItems.count();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
