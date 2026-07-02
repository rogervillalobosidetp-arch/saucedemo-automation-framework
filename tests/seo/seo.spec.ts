import { test, expect } from '../../fixtures/test.fixture';
import type { TestInfo } from '@playwright/test';
import { collectLinks, collectSeo, getStatus, type SeoSnapshot } from '../../utils/seo';
import { env } from '../../utils/env';

/**
 * Auditoría SEO on-page.
 *
 * SauceDemo es una app demo y NO implementa la mayoría de buenas prácticas SEO.
 * Estas pruebas se diseñan como una AUDITORÍA profesional:
 *  - Señales OBLIGATORIAS (que cualquier página debería cumplir) → aserto duro.
 *  - Señales RECOMENDADAS ausentes en el demo → se registran como ANOTACIÓN
 *    ('seo-gap') visible en el reporte HTML/Allure, sin romper el pipeline.
 * Contra un sitio real de producción, basta con convertir estas anotaciones en
 * asertos duros (expect(ok).toBeTruthy()) para exigir el cumplimiento total.
 */

/** Registra una señal SEO como hallazgo/anotación si no se cumple. */
function auditSignal(testInfo: TestInfo, ok: boolean, gap: string): void {
  if (ok) return;
  testInfo.annotations.push({ type: 'seo-gap', description: gap });
}

async function snapshot(page: import('@playwright/test').Page, testInfo: TestInfo) {
  const seo = await collectSeo(page);
  await testInfo.attach('seo-snapshot.json', {
    body: JSON.stringify(seo, null, 2),
    contentType: 'application/json',
  });
  return seo;
}

function auditOnPage(testInfo: TestInfo, seo: SeoSnapshot): void {
  auditSignal(testInfo, !!seo.metaDescription, 'Falta <meta name="description">');
  auditSignal(testInfo, !!seo.metaKeywords, 'Falta <meta name="keywords">');
  auditSignal(testInfo, !!seo.canonical, 'Falta <link rel="canonical">');
  auditSignal(testInfo, !!seo.robots, 'Falta <meta name="robots">');
  auditSignal(testInfo, seo.h1.length === 1, `H1 esperado: 1, encontrado: ${seo.h1.length}`);
  auditSignal(testInfo, seo.h2.length > 0, 'No hay etiquetas H2');
  auditSignal(testInfo, Object.keys(seo.openGraph).length > 0, 'Faltan etiquetas Open Graph');
  auditSignal(testInfo, seo.structuredData.length > 0, 'Falta Structured Data (Schema.org)');
  auditSignal(testInfo, seo.imagesWithoutAlt === 0, `${seo.imagesWithoutAlt} imágenes sin ALT`);
}

test.describe('SEO — página de Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('title presente (obligatorio) y auditoría de señales on-page', async ({
    page,
  }, testInfo) => {
    const seo = await snapshot(page, testInfo);

    // Obligatorio: la página siempre debe tener un <title> con contenido.
    expect(seo.title, 'La página debe tener <title>').toBeTruthy();
    expect((seo.title ?? '').length).toBeGreaterThan(3);

    auditOnPage(testInfo, seo);
  });
});

test.describe('SEO — página de Inventario', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs();
  });

  test('title presente (obligatorio) y auditoría de señales on-page', async ({
    page,
  }, testInfo) => {
    const seo = await snapshot(page, testInfo);
    expect(seo.title, 'La página debe tener <title>').toBeTruthy();
    auditOnPage(testInfo, seo);
  });
});

test.describe('SEO — recursos del sitio', () => {
  test('robots.txt disponible', async ({ request }) => {
    const status = await getStatus(request, `${env.baseURL}/robots.txt`);
    expect(status, 'robots.txt debería responder 200').toBe(200);
  });

  test('sitemap.xml (auditoría)', async ({ request }, testInfo) => {
    const status = await getStatus(request, `${env.baseURL}/sitemap.xml`);
    auditSignal(testInfo, status === 200, `sitemap.xml respondió ${status} (esperado 200)`);
  });

  test('no hay enlaces internos rotos', async ({ page, request }) => {
    await page.goto('/');
    const origin = new URL(env.baseURL).origin;
    const links = (await collectLinks(page, origin)).filter((l) => l.startsWith(origin));

    const rotos: string[] = [];
    for (const link of links) {
      const status = await getStatus(request, link);
      if (status >= 400 || status === 0) rotos.push(`${link} → ${status}`);
    }
    expect(rotos, `Enlaces rotos encontrados:\n${rotos.join('\n')}`).toHaveLength(0);
  });
});
