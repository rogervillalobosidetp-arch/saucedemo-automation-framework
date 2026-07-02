import { expect, Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/helpers';

/** Página de detalle de un producto individual (inventory-item.html). */
export class ProductDetailPage {
  readonly page: Page;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly backButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.name = page.locator('.inventory_details_name');
    this.price = page.locator('.inventory_details_price');
    this.description = page.locator('.inventory_details_desc');
    this.image = page.locator('.inventory_details_img');
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.backButton = page.locator('#back-to-products');
  }

  async expectIsVisible(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory-item\.html/);
    await expect(this.name).toBeVisible();
  }

  async getName(): Promise<string> {
    return (await this.name.innerText()).trim();
  }

  async getPrice(): Promise<number> {
    return parsePrice(await this.price.innerText());
  }

  async goBack(): Promise<void> {
    await this.backButton.click();
  }
}
