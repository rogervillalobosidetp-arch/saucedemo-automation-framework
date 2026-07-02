// Configuración central de las pruebas de carga k6.
// Todo es parametrizable por variables de entorno para poder apuntar a TU
// propio entorno y ajustar la intensidad sin tocar los scripts:
//   k6 run -e BASE_URL=https://staging.tu-app.com -e K6_VUS=20 -e K6_DURATION=1m k6/load.test.js

export const BASE_URL = __ENV.BASE_URL || 'https://www.saucedemo.com';

// Usuarios virtuales concurrentes y duración de la fase sostenida.
export const VUS = Number(__ENV.K6_VUS) || 5;
export const DURATION = __ENV.K6_DURATION || '20s';

// Umbrales de aceptación (SLO). Si no se cumplen, k6 termina con código != 0.
export const thresholds = {
  http_req_failed: ['rate<0.01'], // < 1% de peticiones fallidas
  http_req_duration: ['p(95)<800'], // percentil 95 por debajo de 800 ms
  checks: ['rate>0.99'], // > 99% de checks superados
};

// Cabeceras comunes (identifica el tráfico de prueba de forma honesta).
export const params = {
  headers: { 'User-Agent': 'k6-load-test/saucedemo-framework' },
};
