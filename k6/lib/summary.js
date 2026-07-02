// Genera el resumen de la ejecución: imprime el texto en consola y además
// exporta un JSON a reports/k6/ como evidencia.
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'reports/k6/summary.json': JSON.stringify(data, null, 2),
  };
}
