import { APIRequestContext, Page } from '@playwright/test';

export interface SeoSnapshot {
  title: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonical: string | null;
  robots: string | null;
  h1: string[];
  h2: string[];
  openGraph: Record<string, string>;
  imagesTotal: number;
  imagesWithoutAlt: number;
  structuredData: unknown[];
}

/** Extrae de la página cargada todos los elementos relevantes para SEO. */
export async function collectSeo(page: Page): Promise<SeoSnapshot> {
  return page.evaluate(() => {
    const attr = (sel: string, name: string) =>
      document.querySelector(sel)?.getAttribute(name) ?? null;

    const og: Record<string, string> = {};
    document.querySelectorAll('meta[property^="og:"]').forEach((m) => {
      const prop = m.getAttribute('property');
      const content = m.getAttribute('content');
      if (prop && content) og[prop] = content;
    });

    const images = Array.from(document.querySelectorAll('img'));
    const structured: unknown[] = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        structured.push(JSON.parse(s.textContent ?? ''));
      } catch {
        /* JSON-LD inválido: se ignora aquí y se valida en el test */
      }
    });

    return {
      title: document.title || null,
      metaDescription: attr('meta[name="description"]', 'content'),
      metaKeywords: attr('meta[name="keywords"]', 'content'),
      canonical: attr('link[rel="canonical"]', 'href'),
      robots: attr('meta[name="robots"]', 'content'),
      h1: Array.from(document.querySelectorAll('h1')).map((h) => h.textContent?.trim() ?? ''),
      h2: Array.from(document.querySelectorAll('h2')).map((h) => h.textContent?.trim() ?? ''),
      openGraph: og,
      imagesTotal: images.length,
      imagesWithoutAlt: images.filter((img) => !img.getAttribute('alt')).length,
      structuredData: structured,
    };
  });
}

/** Recolecta todos los enlaces (http/https) internos y externos de la página. */
export async function collectLinks(page: Page, origin: string): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', (anchors) =>
    anchors.map((a) => (a as HTMLAnchorElement).href),
  );
  return [...new Set(hrefs)]
    .filter((h) => h.startsWith('http'))
    .filter((h) => !h.startsWith(`${origin}#`));
}

/** Devuelve el status HTTP de una URL usando el contexto de request de Playwright. */
export async function getStatus(request: APIRequestContext, url: string): Promise<number> {
  try {
    const res = await request.get(url, { timeout: 15_000, maxRedirects: 5 });
    return res.status();
  } catch {
    return 0; // error de red / timeout
  }
}
