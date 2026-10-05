# Ecommerce Frontend (Next.js)

Frontend de e-commerce en **Next.js 16 (App Router) + TypeScript + Tailwind CSS** que consume la API REST
[`Ecommerce-api`](https://github.com/jonathanpacheco1911/Ecommerce-api) (Laravel 12 + Sanctum + Swagger + Stripe).
Flujo completo: catálogo → carrito → orden → pago con Stripe → confirmación → historial.

## Requisitos

- Node.js 20.9 o superior
- La API corriendo (ver su README): `php artisan serve` → `http://localhost:8000/api`
- Cuenta de Stripe en modo test (la misma llave publicable que usa la API)

## Configuración (`.env.example`)

```bash
cp .env.example .env.local
```

| Variable | Descripción |
| --- | --- |
| `BASE_URL` | URL base de la API, con prefijo `/api` y sin `/` final. Ej: `http://localhost:8000/api`. Solo se usa en el servidor. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave publicable de Stripe (`pk_test_...`). Es la única variable visible en el navegador (la necesita Stripe.js). |

## Cómo ejecutar el proyecto

```bash
npm install
npm run dev        # http://localhost:3000
```

Producción (recomendado para medir con Lighthouse):

```bash
npm run build
npm run start
```

Usuario demo de la API (tras `php artisan migrate --seed`): `cliente@demo.com` / `password123`.
Tarjeta de prueba de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

## Rutas implementadas

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Público | Redirige a `/products` |
| `/products` | Público | Catálogo con búsqueda y paginación (`?search=&page=`) |
| `/products/[id]` | Público | Detalle de producto |
| `/register` | Público | Registro (`POST /auth/register`) |
| `/login` | Público | Login (`POST /auth/login`) |
| `/cart` | Público | Carrito (estado local) y creación de la orden |
| `/checkout/[orderId]` | **Protegida** | Resumen y pago con Stripe Elements |
| `/checkout/[orderId]/success` | **Protegida** | Confirmación de compra |
| `/orders` | **Protegida** | Historial de compras del usuario |
| `/auth/logout` | Route Handler | Limpia la cookie cuando la API responde 401 |

## Arquitectura

**Lecturas con Server Components**: catálogo, detalle, historial y confirmación hacen `fetch` en el servidor
(`lib/api.ts`, `lib/data.ts`). El catálogo se cachea 60 s; las vistas protegidas usan `cache: "no-store"`.

**Mutaciones con Server Actions** (`app/actions/`):

- `loginAction`, `registerAction`, `logoutAction`
- `createOrderAction` → `POST /orders`
- `initiatePaymentAction` → `POST /orders/{id}/pay` (devuelve el `client_secret` del PaymentIntent)
- `verifyPaymentAction` → `GET /orders/{id}/payment/status` (sincroniza el estado con Stripe sin depender del webhook)

**Autenticación**: el token de Sanctum se guarda en una cookie `httpOnly` (`secure` en producción, `sameSite=lax`)
desde una Server Action, así que nunca es accesible desde JavaScript del navegador. `proxy.ts` (el reemplazo de
`middleware` en Next.js 16) redirige a `/login?next=...` si falta la cookie; además cada página protegida
valida el token y, si la API responde 401, pasa por `/auth/logout` para limpiar la sesión.

**Carrito**: estado local en `localStorage` con `useSyncExternalStore` (`lib/cart-store.ts`), sincronizado entre
pestañas y sin errores de hidratación.

**Pago**: la orden se crea en la API, luego `Elements` + `PaymentElement` de Stripe confirman el pago en el
navegador con el `client_secret`; después se sincroniza el estado y se muestra la confirmación.

## Rendimiento y resiliencia

| Requisito | Implementación |
| --- | --- |
| `loading.tsx` | `app/products/`, `app/orders/`, `app/checkout/[orderId]/` (skeletons) |
| `error.tsx` | `app/`, `app/products/`, `app/orders/`, `app/checkout/[orderId]/` (con botón "Reintentar") |
| `Suspense` | Lista de productos (`ProductGrid`), historial (`OrdersList`) y menú de usuario del header |
| UI sin datos obsoletos | `revalidatePath()` tras crear orden (`/orders`, `/products`, `/products/[id]`) y tras verificar el pago |
| Web Vitals | Imágenes con dimensiones reservadas (sin CLS), `priority` en las primeras imágenes (LCP), JS de cliente mínimo |

## Evidencia de rendimiento (Lighthouse)

1. `npm run build && npm run start`
2. Abre `http://localhost:3000/products` en Chrome (ventana de incógnito, sin extensiones).
3. DevTools → pestaña **Lighthouse** → modo *Navigation*, dispositivo *Mobile* → **Analyze page load**.
4. Repite para `/products/1`, y para `/orders` con sesión iniciada.
5. Guarda las capturas (o el reporte HTML) en `docs/lighthouse/` y súbelas al repositorio.

Por CLI: `npx lighthouse http://localhost:3000/products --view --output html --output-path docs/lighthouse/products.html`

## Estructura

```
app/
  actions/        Server Actions (auth, orders)
  auth/logout/    Route Handler
  products/       catálogo + detalle (loading, error)
  cart/ login/ register/
  checkout/[orderId]/   pago + success (loading, error)
  orders/         historial (loading, error)
components/       UI (header, cards, formularios, checkout con Stripe)
lib/              api, session, data, cart-store, formato, tipos
proxy.ts          protección de rutas
```
