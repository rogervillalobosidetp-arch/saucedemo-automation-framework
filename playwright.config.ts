import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env';

/**
 * Configuración principal de Playwright.
 * Se definen proyectos independientes por tipo de prueba (funcional, SEO,
 * accesibilidad y performance) para poder ejecutarlos de forma aislada:
 *   npx playwright test --project=functional
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './reports/test-artifacts',
  fullyParallel: true,
  forbidOnly: !!env.ci,
  retries: env.ci ? 2 : 0,
  workers: env.ci ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true }],
  ],

  use: {
    baseURL: env.baseURL,
    headless: env.headless,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'functional',
      testDir: './tests/functional',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'seo',
      testDir: './tests/seo',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'accessibility',
      testDir: './tests/accessibility',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance',
      testDir: './tests/performance',
      // Lighthouse necesita un puerto de depuración remoto fijo y un solo worker.
      workers: 1,
      fullyParallel: false,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { args: ['--remote-debugging-port=9222'] },
      },
    },
  ],
});
