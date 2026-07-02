// Load test: carga sostenida con usuarios concurrentes para medir el
// rendimiento REAL de entrega de la página (latencia, throughput y errores)
// bajo concurrencia. Intensidad modesta por defecto; súbela solo contra tu
// propio entorno vía K6_VUS / K6_DURATION.
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { BASE_URL, VUS, DURATION, thresholds, params } from './lib/config.js';

export { handleSummary } from './lib/summary.js';

// Métrica personalizada: tiempo hasta el primer byte.
const ttfb = new Trend('ttfb_ms', true);

export const options = {
  stages: [
    { duration: '10s', target: VUS }, // ramp-up
    { duration: DURATION, target: VUS }, // carga sostenida
    { duration: '5s', target: 0 }, // ramp-down
  ],
  thresholds,
};

export default function () {
  group('landing page', () => {
    const res = http.get(`${BASE_URL}/`, params);
    ttfb.add(res.timings.waiting);

    check(res, {
      'status es 200': (r) => r.status === 200,
      'HTML no vacío': (r) => r.body && r.body.length > 0,
      'responde en < 800ms': (r) => r.timings.duration < 800,
    });
  });

  sleep(1); // pausa entre iteraciones para simular usuarios reales
}
