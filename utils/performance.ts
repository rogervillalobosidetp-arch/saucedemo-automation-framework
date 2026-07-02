import { Page } from '@playwright/test';

/** Métricas de navegación tomadas de la Navigation Timing API (ms). */
export interface NavMetrics {
  ttfb: number;
  domInteractive: number;
  domContentLoaded: number;
  load: number;
  firstContentfulPaint: number | null;
}

/** Resumen de recursos cargados (Resource Timing API). */
export interface ResourceSummary {
  requestCount: number;
  totalTransferBytes: number;
  byType: Record<string, number>;
}

/** Recolecta las métricas de tiempos de la navegación actual. */
export async function collectNavMetrics(page: Page): Promise<NavMetrics> {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance
      .getEntriesByType('paint')
      .find((e) => e.name === 'first-contentful-paint');
    return {
      ttfb: Math.round(nav.responseStart),
      domInteractive: Math.round(nav.domInteractive),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      firstContentfulPaint: paint ? Math.round(paint.startTime) : null,
    };
  });
}

/** Resume los recursos descargados por la página (conteo, bytes y tipo). */
export async function collectResourceSummary(page: Page): Promise<ResourceSummary> {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const byType: Record<string, number> = {};
    let totalTransferBytes = 0;
    for (const r of resources) {
      byType[r.initiatorType] = (byType[r.initiatorType] ?? 0) + 1;
      totalTransferBytes += r.transferSize || 0;
    }
    return { requestCount: resources.length, totalTransferBytes, byType };
  });
}

/** Mide en milisegundos cuánto tarda una acción asíncrona. */
export async function measure(action: () => Promise<void>): Promise<number> {
  const start = Date.now();
  await action();
  return Date.now() - start;
}
