# Resumen de Pruebas — SauceDemo Automation Framework

Documento resumen de **todos los casos automatizados** en el ejercicio.

- **Aplicación bajo prueba:** [saucedemo.com](https://www.saucedemo.com)
- **Stack:** Playwright + TypeScript · POM · Fixtures · Data Driven Testing
- **Total de pruebas:** **50** · **Resultado:** ✅ 50/50 passed
- **Suites (proyectos Playwright):** funcional · SEO · accesibilidad · performance

| Suite            | Pruebas | Comando                    |
| ---------------- | :-----: | -------------------------- |
| 🧩 Funcional     |   32    | `npm run test:functional`  |
| 🔎 SEO           |    5    | `npm run test:seo`         |
| ♿ Accesibilidad |    4    | `npm run test:a11y`        |
| 🚀 Performance   |    9    | `npm run test:performance` |
| **Total**        | **50**  | `npm test`                 |

---

## 🧩 Funcional (32)

### Login — Data Driven (7) · `tests/functional/login.spec.ts`

Casos parametrizados desde `data/login-cases.json`.

| #   | Caso                               | Resultado esperado                                    |
| --- | ---------------------------------- | ----------------------------------------------------- |
| 1   | Login exitoso con usuario estándar | Redirige a inventario                                 |
| 2   | Usuario bloqueado                  | Error: "Sorry, this user has been locked out."        |
| 3   | Usuario inexistente                | Error: "Username and password do not match any user…" |
| 4   | Contraseña incorrecta              | Error: "Username and password do not match any user…" |
| 5   | Campo usuario vacío                | Error: "Username is required"                         |
| 6   | Campo contraseña vacío             | Error: "Password is required"                         |
| 7   | Ambos campos vacíos                | Error: "Username is required"                         |

### Logout (2) · `tests/functional/logout.spec.ts`

- Cierra la sesión y vuelve al login.
- No permite volver al inventario tras el logout.

### Inventario (5) · `tests/functional/inventory.spec.ts`

- Muestra los 6 productos esperados.
- Valida los **nombres** de todos los productos.
- Valida los **precios** de todos los productos.
- Cada producto tiene **imagen** con `src` válido.
- Cada producto tiene botón **Add To Cart**.

### Ordenamiento (4) · `tests/functional/sorting.spec.ts`

- Nombre **A → Z**
- Nombre **Z → A**
- Precio **menor → mayor**
- Precio **mayor → menor**

### Carrito (5) · `tests/functional/cart.spec.ts`

- Agregar un producto actualiza el badge.
- Agregar **múltiples** productos.
- Eliminar un producto desde el carrito.
- **Vaciar** el carrito por completo.
- El contador **persiste** al navegar entre páginas.

### Checkout (7) · `tests/functional/checkout.spec.ts`

- Flujo **completo** de compra exitoso.
- Validaciones de campos obligatorios (DDT desde `data/checkout-cases.json`):
  - Datos completos válidos
  - Falta nombre
  - Falta apellido
  - Falta código postal
- El **resumen** contiene los productos del carrito.
- Impuesto y total se calculan correctamente: **Total = Subtotal + Impuestos** (impuesto 8%).

### Integridad de datos (2) · `tests/functional/data-integrity.spec.ts`

- Precio en **inventario = detalle** (todos los productos).
- Precio se mantiene **detalle → carrito → checkout** + `Total = Subtotal + Impuestos`.

---

## 🔎 SEO (5) · `tests/seo/seo.spec.ts`

Enfoque **auditoría**: asertos duros en lo obligatorio; señales recomendadas ausentes en
el demo se registran como anotaciones (`seo-gap`) visibles en el reporte.

| Prueba                                          | Tipo         |
| ----------------------------------------------- | ------------ |
| Login — title presente + auditoría on-page      | Duro + audit |
| Inventario — title presente + auditoría on-page | Duro + audit |
| `robots.txt` disponible (200)                   | Duro         |
| `sitemap.xml` (auditoría)                       | Auditoría    |
| No hay enlaces internos rotos                   | Duro         |

**Señales auditadas on-page:** title, meta description, meta keywords, canonical, robots
meta, H1 único, H2, Open Graph, Structured Data (Schema.org), ALT de imágenes.

---

## ♿ Accesibilidad (4) · `tests/accessibility/accessibility.spec.ts`

Integración con **@axe-core/playwright** (WCAG 2.0/2.1 A y AA). Patrón de _baseline de
deuda conocida_: falla solo ante violaciones bloqueantes **nuevas**.

- Página de **Login** sin violaciones bloqueantes nuevas.
- Página de **Inventario** sin violaciones bloqueantes nuevas.
  - Issue conocido documentado: `select-name` (dropdown de orden sin nombre accesible).
- **Contraste de color** (WCAG AA).
- **Navegación por teclado** en el login (Tab → usuario → password → botón).

---

## 🚀 Performance (9) · `tests/performance/`

Cobertura combinada: **Lighthouse** + métricas deterministas del navegador.
Presupuestos parametrizados en `data/performance-budgets.json`.

### Lighthouse (2) · `performance.spec.ts`

- **Login**: gate duro en Performance (≥ 80) y Accessibility (≥ 90); Best Practices y SEO auditados.
- **Inventario (autenticado)**: gate duro en Performance; resto auditado (a11y ~87 por `select-name`).

### Web Vitals / Navigation Timing (2) · `web-vitals.spec.ts`

- **Login** dentro del presupuesto (TTFB, FCP, DOMContentLoaded, Load).
- **Inventario** dentro del presupuesto.

### Presupuesto de recursos (1) · `resource-budget.spec.ts`

- Inventario respeta el presupuesto de **nº de peticiones** y **bytes transferidos**.

### Timing de interacciones (3) · `user-timing.spec.ts`

- **Login → render de inventario** dentro del presupuesto.
- **Agregar al carrito** responde rápido.
- **Ordenar** productos responde rápido.

### Comparativa por usuario (1) · `user-timing.spec.ts`

- `performance_glitch_user` es **más lento** que `standard_user` (detección de degradación).

---

## 🏋️ Pruebas de carga — k6 (`k6/`)

Rendimiento **real bajo carga concurrente** (complementa a Lighthouse/Web Vitals, que son
de un solo usuario). Parametrizable por `BASE_URL`, `K6_VUS`, `K6_DURATION`.

| Escenario | Archivo          | Descripción                                          | Comando             |
| --------- | ---------------- | ---------------------------------------------------- | ------------------- |
| Smoke     | `smoke.test.js`  | 1 VU · disponibilidad y validez del script (CI-safe) | `npm run k6:smoke`  |
| Load      | `load.test.js`   | Carga sostenida (5 VUs / 20s por defecto)            | `npm run k6:load`   |
| Stress    | `stress.test.js` | Estrés progresivo (bloqueado contra sitio público)   | `npm run k6:stress` |

**SLO / thresholds:** `http_req_failed < 1%` · `p(95) < 800ms` · `checks > 99%`.
**Resultado validado:** smoke 3/3 checks · load 417/417 checks, 0% errores, p95 ≈ 28 ms.

---

## 📊 Evidencias y reportes

- **HTML de Playwright** · `reports/html-report`
- **Allure** · `reports/allure-results` → `npm run allure:serve`
- **Lighthouse** (HTML/JSON) · `reports/lighthouse`
- **Screenshots**, **videos** y **trazas** (Trace Viewer) automáticos en fallo.
- Adjuntos por test: snapshots SEO, violaciones a11y, métricas de navegación/recursos y scores Lighthouse.

## ⚙️ Ejecución rápida

```bash
npm test                    # todas las suites
npm run test:functional     # (o :seo · :a11y · :performance)
npm run demo:all            # modo headed, paso a paso (presentaciones)
```
