import { expect, Locator, Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Paso 1: información del cliente
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // Paso 2: overview
  readonly finishButton: Locator;
  readonly summarySubtotal: Locator;
  readonly summaryTax: Locator;
  readonly summaryTotal: Locator;
  readonly overviewItems: Locator;

  // Paso 3: confirmación
  readonly completeHeader: Locator;

  // Validaciones
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.errorMessage = page.locator('[data-test="error"]');

    this.finishButton = page.locator('#finish');
    this.summarySubtotal = page.locator('.summary_subtotal_label');
    this.summaryTax = page.locator('.summary_tax_label');
    this.summaryTotal = page.locator('.summary_total_label');
    this.overviewItems = page.locator('.cart_item');

    this.completeHeader = page.locator('.complete-header');
  }

  private static parseAmount(text: string): number {
    return parseFloat(text.replace(/[^0-9.]/g, ''));
  }

  async getSubtotal(): Promise<number> {
    return CheckoutPage.parseAmount(await this.summarySubtotal.innerText());
  }

  async getTax(): Promise<number> {
    return CheckoutPage.parseAmount(await this.summaryTax.innerText());
  }

  async getTotal(): Promise<number> {
    return CheckoutPage.parseAmount(await this.summaryTotal.innerText());
  }

  async getOverviewItemPrices(): Promise<number[]> {
    const texts = await this.overviewItems.locator('.inventory_item_price').allInnerTexts();
    return texts.map((t) => CheckoutPage.parseAmount(t));
  }

  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async expectValidationError(message?: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  async getOverviewItemNames(): Promise<string[]> {
    return this.overviewItems.locator('.inventory_item_name').allInnerTexts();
  }

  async expectOverviewIsVisible() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.summaryTotal).toBeVisible();
  }

  async finish() {
    await this.finishButton.click();
  }

  async expectOrderComplete() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText(/thank you for your order/i);
  }
}
