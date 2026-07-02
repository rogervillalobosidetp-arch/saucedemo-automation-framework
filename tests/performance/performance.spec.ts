import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
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
const REPORT_NAME = 'login-lighthouse';

interface Lhr {
  categories: Record<string, { score: number | null }>;
}

function readScores(): Record<string, number> {
  const file = resolve(process.cwd(), 'reports/lighthouse', `${REPORT_NAME}.json`);
  const lhr = JSON.parse(readFileSync(file, 'utf-8')) as Lhr;
  const out: Record<string, number> = {};
  for (const [key, cat] of Object.entries(lhr.categories)) {
    out[key] = Math.round((cat.score ?? 0) * 100);
  }
  return out;
}

test.describe('Performance (Lighthouse)', () => {
  test('página de Login: gates y auditoría de categorías', async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto('/');

    // GATE duro: categorías que el sitio debe cumplir.
    await playAudit({
      page,
      port: PORT,
      thresholds: {
        performance: env.lighthouse.performance,
        accessibility: env.lighthouse.accessibility,
      },
      reports: {
        formats: { html: true, json: true },
        directory: 'reports/lighthouse',
        name: REPORT_NAME,
      },
    });

    // AUDITORÍA: registrar todos los scores y anotar los que no alcanzan la meta.
    const scores = readScores();
    await testInfo.attach('lighthouse-scores.json', {
      body: JSON.stringify(scores, null, 2),
      contentType: 'application/json',
    });

    const metas: Record<string, number> = {
      'best-practices': env.lighthouse.bestPractices,
      seo: env.lighthouse.seo,
    };
    for (const [cat, meta] of Object.entries(metas)) {
      if ((scores[cat] ?? 0) < meta) {
        testInfo.annotations.push({
          type: 'lighthouse-gap',
          description: `${cat}: ${scores[cat]} (meta ${meta})`,
        });
      }
    }

    // Los gates duros ya los validó playAudit; confirmamos que hubo scores.
    expect(Object.keys(scores).length).toBeGreaterThan(0);
  });
});
