import { Page } from '@playwright/test';

/**
 * Clase base para todos los Page Objects.
 * Centraliza la referencia a `page` y utilidades comunes de navegación.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
