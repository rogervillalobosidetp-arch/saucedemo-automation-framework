# SauceDemo Automation Framework

[![CI - Playwright](https://github.com/rogervillalobosidetp-arch/saucedemo-automation-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/rogervillalobosidetp-arch/saucedemo-automation-framework/actions/workflows/ci.yml)

Framework de automatización de pruebas **profesional y escalable** para
[saucedemo.com](https://www.saucedemo.com), construido con **Playwright + TypeScript**.

Incluye pruebas **funcionales**, **SEO**, **accesibilidad** y **performance**, con
**Page Object Model**, **fixtures**, **Data Driven Testing**, **variables de entorno**,
**reportes Allure + HTML**, **GitHub Actions**, **ESLint** y **Prettier**.

---

## 🏗️ Arquitectura

```
saucedemo-proyecto/
├── .github/workflows/       # CI (GitHub Actions)
│   └── ci.yml
├── data/                    # Datos para Data Driven Testing (JSON)
│   ├── login-cases.json
│   ├── checkout-cases.json
│   ├── products.json
│   ├── seo-pages.json
│   └── performance-budgets.json
├── fixtures/                # Fixtures de Playwright (inyección de Page Objects)
│   └── test.fixture.ts
├── pages/                   # Page Object Model
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── product-detail.page.ts
│   ├── cart.page.ts
│   ├── checkout.page.ts
│   ├── header.component.ts
│   └── index.ts             # barrel
├── tests/
│   ├── functional/          # login, logout, inventario, sorting, carrito, checkout, integridad
│   ├── seo/                 # auditoría SEO on-page + recursos del sitio
│   ├── accessibility/       # axe-core (WCAG A/AA)
│   └── performance/         # Lighthouse + Web Vitals + presupuestos + timing
├── utils/                   # env, helpers, data loader, tipos, seo utils
├── reports/                 # HTML, Allure, Lighthouse, trazas, videos (generado)
├── eslint.config.mjs
├── .prettierrc.json
├── .env / .env.example
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Puesta en marcha

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env        # ajusta valores si es necesario
```

## ▶️ Ejecución

| Comando                    | Descripción                       |
| -------------------------- | --------------------------------- |
| `npm test`                 | Ejecuta **todas** las suites      |
| `npm run test:functional`  | Solo pruebas funcionales          |
| `npm run test:seo`         | Solo auditoría SEO                |
| `npm run test:a11y`        | Solo accesibilidad (axe-core)     |
| `npm run test:performance` | Solo performance (Lighthouse)     |
| `npm run test:headed`      | Con navegador visible             |
| `npm run test:ui`          | Modo UI interactivo de Playwright |
| `npm run test:debug`       | Modo debug                        |

Cada suite es un **proyecto** independiente de Playwright, por lo que puede
ejecutarse de forma aislada: `npx playwright test --project=functional`.

### 🎬 Modo demo (presentaciones)

Ejecutan cada suite con **navegador visible** (`--headed`) y **una prueba a la
vez** (`--workers=1`) para poder seguir cada flujo en pantalla.

| Comando             | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run demo:a11y` | Accesibilidad, paso a paso                             |
| `npm run demo:func` | Funcional, paso a paso                                 |
| `npm run demo:seo`  | SEO, paso a paso                                       |
| `npm run demo:perf` | Performance (Lighthouse), paso a paso                  |
| `npm run demo:all`  | Todas en orden: accesibilidad → funcional → SEO → perf |

## 📊 Reportería

- **HTML de Playwright**: `npm run report:html` → `reports/html-report`
- **Allure**:
  ```bash
  npm run allure:generate   # genera reports/allure-report
  npm run allure:open       # abre el reporte
  # o directamente:
  npm run allure:serve
  ```
- **Evidencias automáticas** (configuradas en `playwright.config.ts`):
  - 📸 **Screenshots** en fallos (`screenshot: only-on-failure`)
  - 🎥 **Videos** en fallos (`video: retain-on-failure`)
  - 🔍 **Trazas** para el Trace Viewer (`trace: retain-on-failure`)
  - 🚦 **Lighthouse** HTML/JSON en `reports/lighthouse`

## 🧪 Cobertura de pruebas

### Funcionales (`tests/functional`)

- **Login (DDT)**: exitoso, usuario bloqueado, inexistente, contraseña incorrecta, campos vacíos y validación de mensajes de error (desde `data/login-cases.json`).
- **Logout**: cierre de sesión y bloqueo de acceso posterior.
- **Inventario**: visualización, nombres, precios, imágenes y botones _Add To Cart_.
- **Ordenamiento**: Nombre A-Z / Z-A, Precio menor→mayor / mayor→menor.
- **Carrito**: agregar uno/múltiples, eliminar, vaciar y persistencia del contador.
- **Checkout**: flujo completo, validaciones de campos obligatorios (DDT), resumen, impuestos y total.
- **Integridad de datos**: `inventario === detalle === carrito === checkout` y `Total = Subtotal + Impuestos` (cálculo **dinámico**, impuesto 8%).

### SEO (`tests/seo`)

Title, meta description, meta keywords, H1 único, H2, ALT de imágenes, canonical,
Open Graph, robots meta, `sitemap.xml`, `robots.txt`, enlaces rotos y Structured Data.

> ℹ️ SauceDemo es una demo y no implementa la mayoría de buenas prácticas SEO.
> Las señales **obligatorias** (title, robots.txt, enlaces rotos) se validan de forma
> estricta y las **recomendadas** ausentes en el demo se registran como **anotaciones**
> de auditoría (`seo-gap`) visibles en el reporte, sin romper el pipeline. Contra un
> sitio de producción real basta con convertirlas en asertos duros.

### Accesibilidad (`tests/accessibility`)

Integración con **@axe-core/playwright** (WCAG 2.0/2.1 A y AA): violaciones
bloqueantes (critical/serious), contraste de color y navegación básica por teclado.

### Performance (`tests/performance`)

Cobertura combinada (Lighthouse + métricas deterministas del navegador):

- **Lighthouse** (`performance.spec.ts`) en Login e Inventario (autenticado). Metas
  configurables por `.env` (Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90,
  SEO ≥ 90). Las categorías que el sitio cumple son **gate duro**; el resto se registra
  como **anotación** con el score real. Reportes HTML/JSON en `reports/lighthouse`.
- **Web Vitals / Navigation Timing** (`web-vitals.spec.ts`): TTFB, FCP, DOMContentLoaded
  y Load contra presupuestos por página (`data/performance-budgets.json`).
- **Presupuesto de recursos** (`resource-budget.spec.ts`): nº de peticiones y bytes
  transferidos por página, para frenar regresiones de peso.
- **Timing de interacciones** (`user-timing.spec.ts`): login→inventario, add-to-cart y
  ordenamiento dentro de presupuesto.
- **Comparativa por usuario**: `performance_glitch_user` (usuario lento intencional)
  debe ser más lento que `standard_user` — demuestra la detección de degradación.

## 🔧 Calidad de código

```bash
npm run lint         # ESLint
npm run lint:fix
npm run format       # Prettier
npm run format:check
npm run typecheck    # tsc --noEmit
```

## 🔐 Variables de entorno

Definidas en `.env` (ver `.env.example`): `BASE_URL`, credenciales, `HEADLESS`,
`CI` y umbrales de Lighthouse. Centralizadas en `utils/env.ts`.

## 🤖 CI (GitHub Actions)

`.github/workflows/ci.yml` ejecuta en cada push/PR:

1. **Quality**: `format:check`, `lint`, `typecheck`.
2. **E2E** (matriz): `functional`, `seo`, `accessibility` — sube reportes HTML y Allure como artefactos.
3. **Performance**: Lighthouse (job opcional, `continue-on-error`).

## 👤 Usuarios de prueba

Todos con contraseña `secret_sauce`: `standard_user`, `locked_out_user`,
`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`.
