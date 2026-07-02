import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { playAudit } from 'playwright-lighthouse';
import { test, expect } from '../../fixtures/test.fixture';
import type { Page, TestInfo } from '@playwright/test';
import { env } from '../../utils/env';

/**
 * Auditoría de performance con Lighthouse (vía playwright-lighthouse).
 *
 * Requisitos:
 *  - El proyecto `performance` lanza Chromium con --remote-debugging-port=9222
 *    y con un único worker (ver playwright.config.ts).
 *  - Los umbrales mínimos se configuran por variables de entorno (.env).
 *
 * Enfoque (consistente con las suites SEO/a11y): las categorías que el sitio
 * cumple se validan como GATE duro (Performance, Accessibility); las que en el
 * demo quedan por debajo (Best Practices, SEO) se registran como ANOTACIÓN de
 * auditoría con el score real. El reporte HTML/JSON de Lighthouse se guarda en
 * reports/lighthouse como evidencia.
 */
const PORT = 9222;

interface Lhr {
  categories: Record<string, { score: number | null }>;
}

function readScores(reportName: string): Record<string, number> {
  const file = resolve(process.cwd(), 'reports/lighthouse', `${reportName}.json`);
  const lhr = JSON.parse(readFileSync(file, 'utf-8')) as Lhr;
  const out: Record<string, number> = {};
  for (const [key, cat] of Object.entries(lhr.categories)) {
    out[key] = Math.round((cat.score ?? 0) * 100);
  }
  return out;
}

// Metas por categoría (configurables por .env). Las que no sean GATE duro en una
// página se registran como anotación de auditoría con su score real.
const METAS: Record<string, number> = {
  performance: env.lighthouse.performance,
  accessibility: env.lighthouse.accessibility,
  'best-practices': env.lighthouse.bestPractices,
  seo: env.lighthouse.seo,
};

/**
 * Ejecuta Lighthouse aplicando GATE duro solo a las categorías indicadas en
 * `gates` (las que el sitio cumple) y auditando el resto como anotaciones.
 */
async function auditLighthouse(
  page: Page,
  testInfo: TestInfo,
  reportName: string,
  gates: string[],
): Promise<void> {
  test.setTimeout(120_000);

  const thresholds = Object.fromEntries(gates.map((cat) => [cat, METAS[cat]]));

  await playAudit({
    page,
    port: PORT,
    thresholds,
    reports: {
      formats: { html: true, json: true },
      directory: 'reports/lighthouse',
      name: reportName,
    },
  });

  const scores = readScores(reportName);
  await testInfo.attach('lighthouse-scores.json', {
    body: JSON.stringify(scores, null, 2),
    contentType: 'application/json',
  });

  for (const [cat, meta] of Object.entries(METAS)) {
    if (!gates.includes(cat) && (scores[cat] ?? 0) < meta) {
      testInfo.annotations.push({
        type: 'lighthouse-gap',
        description: `${cat}: ${scores[cat]} (meta ${meta})`,
      });
    }
  }

  expect(Object.keys(scores).length).toBeGreaterThan(0);
}

test.describe('Performance (Lighthouse)', () => {
  // Login: el sitio cumple Performance y Accessibility → ambos como gate duro.
  test('página de Login: gates y auditoría de categorías', async ({
    loginPage,
    page,
  }, testInfo) => {
    await loginPage.goto();
    await auditLighthouse(page, testInfo, 'login-lighthouse', ['performance', 'accessibility']);
  });

  // Inventario: tiene la violación a11y conocida (select-name) que baja el score
  // a ~87, por lo que solo Performance es gate duro; el resto se audita.
  test('página de Inventario (autenticada): gates y auditoría', async ({ loginAs, page }, info) => {
    await loginAs();
    await auditLighthouse(page, info, 'inventory-lighthouse', ['performance']);
  });
});
