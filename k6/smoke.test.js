// Smoke test: 1 usuario, 1 iteración. Valida que el endpoint responde y que el
// script está bien antes de lanzar carga real. Ideal para CI en cada push.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, params } from './lib/config.js';

export { handleSummary } from './lib/summary.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`, params);

  check(res, {
    'status es 200': (r) => r.status === 200,
    'contiene la app (Swag Labs)': (r) => r.body && r.body.includes('Swag Labs'),
    'responde en < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
