import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { LoginCase, CheckoutCase, SeoPage } from './types';

/**
 * Carga los archivos JSON de `data/` para el Data Driven Testing.
 * Se usa lectura por filesystem (relativa al root del proyecto) para evitar
 * incompatibilidades entre resolución de módulos CJS/ESM al importar JSON.
 */
const dataDir = resolve(process.cwd(), 'data');

function load<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(dataDir, file), 'utf-8')) as T;
}

export interface ProductsData {
  esperados: { nombre: string; precio: number }[];
  totalEsperado: number;
  carritoMultiple: string[];
}

export const loginCases = load<LoginCase[]>('login-cases.json');
export const checkoutCases = load<CheckoutCase[]>('checkout-cases.json');
export const products = load<ProductsData>('products.json');
export const seoPages = load<SeoPage[]>('seo-pages.json');
