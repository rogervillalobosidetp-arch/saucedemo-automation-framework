// Stress test: sube la concurrencia hasta encontrar el punto de degradación.
// Pensado para TU propio entorno de pruebas/staging.
//
// ⚠️ Salvaguarda: se niega a ejecutar carga alta contra el sitio público de
// terceros (saucedemo.com) salvo que lo autorices con ALLOW_PUBLIC=1, para
// evitar un uso abusivo. Lo correcto es apuntar a tu entorno:
//   k6 run -e BASE_URL=https://staging.tu-app.com k6/stress.test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, params } from './lib/config.js';

export { handleSummary } from './lib/summary.js';

const isPublicDemo = BASE_URL.includes('saucedemo.com');
const allowPublic = __ENV.ALLOW_PUBLIC === '1';

if (isPublicDemo && !allowPublic) {
  throw new Error(
    'Stress test bloqueado contra el sitio público de terceros. Apunta a tu entorno con -e BASE_URL=... o fuerza con -e ALLOW_PUBLIC=1 bajo tu responsabilidad.',
  );
}

const PEAK = Number(__ENV.K6_PEAK) || 30;

export const options = {
  stages: [
    { duration: '20s', target: PEAK }, // subida progresiva
    { duration: '40s', target: PEAK }, // meseta a carga alta
    { duration: '20s', target: PEAK * 2 }, // pico de estrés
    { duration: '20s', target: 0 }, // recuperación
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // toleramos hasta 5% bajo estrés
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`, params);
  check(res, {
    'status es 200': (r) => r.status === 200,
  });
  sleep(1);
}
