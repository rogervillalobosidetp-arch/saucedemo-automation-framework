import { expect, Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;
  readonly addToCartButtons: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemImages = page.locator('.inventory_item_img img');
    this.addToCartButtons = page.getByRole('button', { name: /add to cart/i });
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async count(): Promise<number> {
    return this.inventoryItems.count();
  }

  /** Abre la página de detalle haciendo click sobre el nombre del producto. */
  async openProduct(name: string): Promise<void> {
    await this.productCard(name).locator('.inventory_item_name').click();
  }

  /** Devuelve las URLs (src) de todas las imágenes de producto. */
  async getImageSources(): Promise<string[]> {
    return this.itemImages.evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).getAttribute('src') ?? ''),
    );
  }

  async expectIsVisible() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.inventoryList).toBeVisible();
  }

  productCard(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  async addToCart(name: string) {
    await this.productCard(name)
      .getByRole('button', { name: /add to cart/i })
      .click();
  }

  async removeFromCart(name: string) {
    await this.productCard(name)
      .getByRole('button', { name: /remove/i })
      .click();
  }

  async getPrice(name: string): Promise<number> {
    const text = await this.productCard(name).locator('.inventory_item_price').innerText();
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getProductNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allInnerTexts();
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allInnerTexts();
    return texts.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')));
  }

  async expectCartCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }
}
