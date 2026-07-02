/**
 * Utilidades de propósito general reutilizables en toda la suite.
 */

/** Convierte un texto con moneda ("$29.99", "Total: $32.39") en número. */
export function parsePrice(text: string): number {
  const value = parseFloat(text.replace(/[^0-9.]/g, ''));
  if (Number.isNaN(value)) {
    throw new Error(`No se pudo parsear un precio a partir de: "${text}"`);
  }
  return value;
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Suma una lista de importes con redondeo a 2 decimales. */
export function sum(values: number[]): number {
  return round2(values.reduce((acc, n) => acc + n, 0));
}

/** Verifica si un arreglo numérico está ordenado ascendentemente. */
export function isSortedAsc(values: number[]): boolean {
  return values.every((v, i) => i === 0 || values[i - 1] <= v);
}

/** Verifica si un arreglo numérico está ordenado descendentemente. */
export function isSortedDesc(values: number[]): boolean {
  return values.every((v, i) => i === 0 || values[i - 1] >= v);
}

/** Verifica si un arreglo de strings está ordenado alfabéticamente (locale). */
export function isSortedAlphaAsc(values: string[]): boolean {
  return values.every((v, i) => i === 0 || values[i - 1].localeCompare(v) <= 0);
}

export function isSortedAlphaDesc(values: string[]): boolean {
  return values.every((v, i) => i === 0 || values[i - 1].localeCompare(v) >= 0);
}
