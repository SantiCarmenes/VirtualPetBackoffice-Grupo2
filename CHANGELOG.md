# Changelog — VirtualPet Backoffice

## Resumen del Proyecto
Backoffice para gestión de pedidos, envíos e incidencias del e-commerce VirtualPet.
Stack: Next.js 14 + TanStack Query + Tailwind CSS + shadcn/ui + fetch nativo.

---

## 2025-05-19 — Conexión Completa a API Real

### Contexto
El proyecto fue inicialmente desarrollado con mocks estáticos y bypasses de autenticación para acelerar el desarrollo frontend. Esta sesión removió todos los mocks y conectó cada módulo a la API backend real desplegada en `https://api-virtualpet.vercel.app`.

---

## Fase 1: Autenticación (Auth Module)

### Decisiones Arquitectónicas

1. **Dual Token Storage**: La API devuelve `accessToken` (15 min) y `refreshToken` (7 días). Se implementó almacenamiento dual en `localStorage` + `cookie` para compatibilidad con Next.js middleware (que solo lee cookies).
2. **Silent Refresh en apiClient**: Cuando una request recibe 401, el `apiClient` automáticamente intenta refrescar el token sin intervención del usuario. Si falla, redirige a `/login`.
3. **Enforcement de Rol BACKOFFICE**: Al hacer login, se consulta `GET /users/me` y se verifica `role === 'BACKOFFICE'`. Usuarios con rol `USER` son rechazados inmediatamente.
4. **Eliminación de estado `isAuth`**: La autenticación se deriva directamente de la existencia del token en storage (`!!getToken()`). No hay estado duplicado en React.

### Endpoints Conectados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/auth/login` | POST | Login con email/password |
| `/auth/logout` | POST | Logout (envía refreshToken en body) |
| `/auth/refresh` | POST | Renovación silenciosa de access token |
| `/users/me` | GET | Perfil del usuario autenticado |

### Archivos Creados / Modificados

- `.env.local` — Actualizado `NEXT_PUBLIC_API_URL`
- `src/lib/auth.ts` — Dual-token storage, removido `MOCK_ADMIN_TOKEN`
- `src/lib/apiClient.ts` — Silent refresh con queue de requests pendientes
- `src/services/authService.ts` — Conectado a endpoints reales, removido bypass
- `src/hooks/useAuth.ts` — Sin estado `isAuth`, con verificación de rol
- `src/app/login/page.tsx` — Formulario real de login
- `src/middleware.ts` — Guard de autenticación activado
- `src/app/(dashboard)/layout.tsx` — Muestra `user.firstName` real

---

## Fase 2: Pedidos y Envíos (Orders → Shipments)

### Decisiones Arquitectónicas

1. **Domain Mapping (Orders → Shipments)**: La API trabaja con "Orders" (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`). La UI está construida en torno a "Shipments" con statuses más granulares (`IN_TRANSIT`, `FAILED_ATTEMPT_1`, etc.). Se implementó una capa de mapeo en `shipmentService.ts` para no reescribir toda la UI.
2. **Mapper bidireccional**:
   - `PENDING` → `PENDING`
   - `CONFIRMED` / `SHIPPED` → `IN_TRANSIT`
   - `DELIVERED` → `DELIVERED`
   - `CANCELLED` → `CANCELLED`
3. **Soft Delete de Mocks**: Eliminados `shipmentMockRepository.ts` y `operatorsMock.ts`. El patrón "try API, fallback to mock" fue removido de todos los servicios.
4. **Nuevo status CANCELLED**: Agregado al sistema de statuses de UI para reflejar pedidos cancelados desde la API.

### Endpoints Conectados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/orders/all` | GET | Listar todos los pedidos (admin) con paginación |
| `/orders/:id` | GET | Detalle de un pedido |
| `/orders/:id/status` | PATCH | Actualizar estado del pedido |

### Archivos Creados

- `src/services/orderService.ts` — Cliente directo a `/orders/*`
- `src/types/shipment.ts` — Tipos `Order`, `OrderItem`, `OrdersResponse`, `ShippingMethod`, `CANCELLED`

### Archivos Modificados

- `src/services/shipmentService.ts` — Ahora es un mapper sobre `orderService`
- `src/services/fulfillmentService.ts` — Llama a `PATCH /orders/:id/status`
- `src/hooks/useShipments.ts` — Sin fallback a mocks
- `src/hooks/useIssues.ts` — Sin fallback a mocks
- `src/components/shipments/status-badge.tsx` — Estilo para `CANCELLED`
- `src/components/issues/issues-table.tsx` — Maneja `CANCELLED` como "Cancelado"
- `src/app/(dashboard)/dashboard/page.tsx` — Actualizado summary cards

### Archivos Eliminados

- `src/mocks/shipmentMockRepository.ts`
- `src/mocks/operatorsMock.ts`
- `src/services/operatorService.ts`
- `src/hooks/useOperators.ts`

---

## Fase 3: Paginación (Phase B)

### Decisiones Arquitectónicas

1. **20 items por página**: Valor consistente con el default de la API.
2. **Reset de página al filtrar**: Cambiar el filtro de estado resetea la página a 1 para evitar páginas vacías.
3. **Issues sin paginación UI**: La página de incidencias agrega 4 statuses diferentes (`TOTAL_REFUND`, `PARTIAL_REFUND`, `MISSING_STOCK`, `CANCELLED`). Se optó por fetch de hasta 100 items y mostrar todo en una tabla sin paginador, ya que el volumen de incidencias suele ser bajo.
4. **Componente Pagination reutilizable**: Creado en `src/components/ui/pagination.tsx` con info "Mostrando X–Y de Z".

### Archivos Creados

- `src/components/ui/pagination.tsx` — Botones Prev/Next + info de página

### Archivos Modificados

- `src/app/(dashboard)/shipments/page.tsx` — Estado `page` + `<Pagination />`
- `src/app/(dashboard)/pending/page.tsx` — Estado `page` + `<Pagination />`
- `src/app/(dashboard)/issues/page.tsx` — Fetch con `limit: 100`
- `src/services/shipmentService.ts` — `ShipmentsResponse` incluye `pages`

---

## Fase 4: Métodos de Envío (Phase A)

### Decisiones Arquitectónicas

1. **Reemplazo de hardcoded logistics**: Los 3 valores fijos (`INTERNAL_DELIVERY`, `COURIER_1`, `COURIER_2`) fueron reemplazados por datos dinámicos de `GET /shipping/methods`.
2. **Display enriquecido**: El dropdown muestra `Nombre — $Costo (X días)` en lugar de solo el nombre.
3. **Tipo `logisticsType` como string**: Simplificado de `LogisticsType` union type a `string` para compatibilidad con IDs dinámicos de la API.

### Endpoints Conectados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/shipping/methods` | GET | Listar métodos de envío disponibles |

### Archivos Creados

- `src/services/shippingService.ts`
- `src/hooks/useShippingMethods.ts`

### Archivos Modificados

- `src/components/shipments/fulfillment-checklist.tsx` — Dropdown dinámico con `useShippingMethods`
- `src/types/shipment.ts` — Nuevo tipo `ShippingMethod`, `logisticsType` como string
- `src/types/shipment.ts` — `FulfillmentPayload.logisticsType` como string

---

## Fase 5: Enriquecimiento del Detalle (Phase C)

### Decisiones Arquitectónicas

1. **Mostrar datos del cliente en preparación**: La página de fulfillment ahora incluye una tarjeta "Información del Cliente" con email, nombre, dirección completa y estado de pago.
2. **Dirección como string concatenada**: Los campos `street`, `city`, `province`, `postalCode` se unen con comas para display limpio.
3. **Badge de estado de pago**: Colores semánticos según `PENDING` (amarillo), `APPROVED` (verde), `REJECTED` (rojo), `REFUNDED` (gris).

### Endpoints Conectados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/payment/orders/:orderId` | GET | Estado del pago asociado a un pedido |

### Archivos Creados

- `src/services/paymentService.ts`
- `src/hooks/usePayment.ts`

### Archivos Modificados

- `src/types/shipment.ts` — `Shipment` ahora tiene `customerEmail` y `shippingAddress`
- `src/services/shipmentService.ts` — Mapper incluye email + address
- `src/components/shipments/fulfillment-checklist.tsx` — Nueva tarjeta de info del cliente

---

## Fase 6: Ciclo de Vida del Envío (Shipping Lifecycle)

### Contexto
Los pedidos llegan al backoffice con estado `CONFIRMED` (ya confirmados por el cliente). El backoffice debe gestionar el ciclo completo de preparación y envío, operando sobre el recurso `shipping` de la API, no solo sobre `orders`.

### Decisiones Arquitectónicas

1. **Separación Order vs Shipping**: El backoffice opera sobre **shipping** (`PENDING → PROCESSING → SHIPPED → DELIVERED`), no sobre el order directamente. El order solo se actualiza a `SHIPPED`/`DELIVERED` como efecto colateral.
2. **Shipping record creado en fulfillment page**: No se crea inmediatamente al hacer click en la lista. El admin debe seleccionar un método de envío primero.
3. **Máquina de estados en el frontend**: La página de fulfillment tiene 3 estados visuales:
   - **Sin shipping record**: Selector de método + "Iniciar Preparación"
   - **Shipping `PENDING`**: Checklist de productos + "Completar Empaque" → `PROCESSING`
   - **Shipping `PROCESSING`**: "Entregar a Mensajería" → `SHIPPED` + order `SHIPPED`
4. **Timeline visual**: Se muestra una barra de progreso con los 4 pasos: Pendiente → En Preparación → En Tránsito → Entregado.
5. **Discrepancia**: Si faltan productos, el pedido se cancela (`PATCH /orders/:id/status` → `CANCELLED`). No se crea shipping record.
6. **Marcar como Entregado**: Desde la tabla `/shipments`, los pedidos `IN_TRANSIT` tienen un botón directo para pasar a `DELIVERED`.

### Endpoints Conectados

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/shipping` | POST | Crear registro de envío para un pedido |
| `/shipping/orders/:orderId` | GET | Obtener estado del envío de un pedido |
| `/shipping/orders/:orderId/status` | PATCH | Actualizar estado del envío |

### Flujo Completo

| Paso | Acción del Admin | Estado Shipping | Estado Order | API Calls |
|------|------------------|-----------------|--------------|-----------|
| 1 | Entra a fulfillment | — | `CONFIRMED` | Ninguna |
| 2 | Inicia preparación | `PENDING` | `CONFIRMED` | `POST /shipping` |
| 3 | Completa empaque | `PROCESSING` | `CONFIRMED` | `PATCH /shipping/orders/:id/status` |
| 4 | Entrega a mensajería | `SHIPPED` | `SHIPPED` | `PATCH /shipping/orders/:id/status` + `PATCH /orders/:id/status` |
| 5 | Cliente recibe | `DELIVERED` | `DELIVERED` | `PATCH /shipping/orders/:id/status` + `PATCH /orders/:id/status` |
| — | Discrepancia | — | `CANCELLED` | `PATCH /orders/:id/status` |

### Archivos Creados

- `src/services/shippingService.ts` — `POST /shipping`, `GET /shipping/orders/:id`, `PATCH /shipping/orders/:id/status`
- `src/hooks/useShipping.ts` — Query hook para shipping detail
- `src/hooks/useCreateShipping.ts` — Mutation para crear shipping
- `src/hooks/useUpdateShippingStatus.ts` — Mutation para actualizar shipping status
- `src/hooks/useCreateShippingRecord.ts` — Mutation wrapper para el flujo de fulfillment
- `src/components/ui/pagination.tsx` — Componente reutilizable de paginación

### Archivos Creados (Adicionales a Fase 6)

- `src/services/userService.ts` — `GET /users`, filtra BACKOFFICE users para operarios
- `src/hooks/useUsers.ts` — Query hook para usuarios
- `src/services/warehouseService.ts` — `GET /warehouses`
- `src/services/stockService.ts` — `GET /stock/variants/:id`, `POST /stock`
- `src/hooks/useWarehouses.ts` — Query hook para depósitos
- `src/hooks/useStock.ts` — Query y mutation hooks para stock

### Archivos Modificados

- `src/types/shipment.ts` — Nuevos tipos: `ShippingApiStatus`, `ShippingRecord`, `FAILED_DELIVERY`. `Shipment` ahora incluye `shippingId`, `shippingStatus`, `shippingEstimatedDelivery`.
- `src/services/shipmentService.ts` — Ahora hace `Promise.all` para obtener order + shipping simultáneamente. `CONFIRMED` se mapea a `PENDING` (UI).
- `src/services/fulfillmentService.ts` — Máquina de estados completa: `createShippingRecord`, `updateShippingStatus`, `submitFulfillment`.
- `src/hooks/useFulfillmentMutation.ts` — Ahora acepta `updateOrderStatus: 'CANCELLED'`.
- `src/components/shipments/fulfillment-checklist.tsx` — **Reescritura completa** con:
  - Dropdown de operarios (BACKOFFICE users desde `/users`)
  - Selector de depósito de origen (warehouses)
  - **Descontado automático de stock** al completar empaque
  - State machine, timeline visual, tarjeta de info del cliente
- `src/components/shipments/shipments-table.tsx` — Agregado botón "Entregado" para filas `IN_TRANSIT`.
- `src/components/shipments/status-badge.tsx` — Agregado estilo para `FAILED_DELIVERY`.
- `src/components/issues/issues-table.tsx` — Actualizado `getIssueType` para remover `REFUND`.
- `src/app/(dashboard)/pending/page.tsx` — Título actualizado a "Pendientes de Preparación".
- `src/app/(dashboard)/shipments/page.tsx` — Filtros actualizados para `IN_TRANSIT`, `DELIVERED`, `CANCELLED`.
- `src/app/(dashboard)/dashboard/page.tsx` — Counters actualizados (Pending, In Transit, Delivered, Cancelled).
- `src/app/(dashboard)/issues/page.tsx` — **Paginación server-side** para `CANCELLED` orders.

### Status Eliminados del Uso Activo

- `TOTAL_REFUND` — La API no lo devuelve
- `PARTIAL_REFUND` — La API no lo devuelve
- `FAILED_ATTEMPT_1`, `FAILED_ATTEMPT_2`, `FAILED_ATTEMPT_3` — Reemplazados por `FAILED_DELIVERY`

---

## Estado Actual de Conectividad

| Feature | Estado | Endpoint |
|---------|--------|----------|
| Login / Logout | ✅ Real | `/auth/login`, `/auth/logout` |
| Perfil de usuario | ✅ Real | `/users/me` |
| Silent token refresh | ✅ Real | `/auth/refresh` |
| Listar pedidos | ✅ Real | `/orders/all` |
| Detalle de pedido | ✅ Real | `/orders/:id` |
| Actualizar estado de pedido | ✅ Real | `/orders/:id/status` |
| Crear envío | ✅ Real | `POST /shipping` |
| Obtener envío por orden | ✅ Real | `GET /shipping/orders/:orderId` |
| Actualizar estado de envío | ✅ Real | `PATCH /shipping/orders/:orderId/status` |
| Métodos de envío | ✅ Real | `/shipping/methods` |
| Estado de pago | ✅ Real | `/payment/orders/:orderId` |
| Paginación | ✅ Real | Query params `page`, `limit` |

---

## Mapeo de Dominio (API → UI)

| API Order Status | API Shipping Status | UI Shipment Status | Dónde aparece |
|------------------|---------------------|--------------------|---------------|
| `CONFIRMED` | — | `PENDING` | `/pending` |
| `CONFIRMED` | `PENDING` | `PENDING` | `/pending` |
| `CONFIRMED` | `PROCESSING` | `PENDING` | `/pending` |
| `SHIPPED` | `SHIPPED` | `IN_TRANSIT` | `/shipments` |
| `DELIVERED` | `DELIVERED` | `DELIVERED` | `/shipments` |
| `CANCELLED` | — | `CANCELLED` | `/issues` |

### Leyenda de Estados UI

| UI Status | Significado |
|-----------|-------------|
| `PENDING` | Pedido confirmado, pendiente de preparación/envío |
| `IN_TRANSIT` | Pedido entregado a mensajería, en camino |
| `DELIVERED` | Pedido recibido por el cliente |
| `CANCELLED` | Pedido cancelado (discrepancia o manual) |
| `FAILED_DELIVERY` | Entrega fallida después de 3 intentos |
| `MISSING_STOCK` | Stock faltante (reservado para uso futuro) |

---

## Gestión de Stock

### Flujo de Descontado de Stock

Cuando el operario completa el empaque (shipping status `PENDING` → `PROCESSING`):

1. Se obtiene el stock actual de cada variante del pedido via `GET /stock/variants/:variantId`
2. Se localiza el registro de stock para el depósito seleccionado
3. Se calcula: `nuevaCantidad = cantidadActual - cantidadDelPedido`
4. Se actualiza via `POST /stock` (upsert)

### Consideraciones

- Si un producto no tiene stock en el depósito seleccionado, se crea un registro con cantidad 0
- No hay validación de stock insuficiente (la API acepta cantidad negativa o cero)
- El descontado es atómico por producto (Promise.all en paralelo)

---

## Limitaciones Conocidas / Deuda Técnica

1. **Operarios**: Los operarios son usuarios con rol `BACKOFFICE` obtenidos de `GET /users`. No hay endpoint dedicado `/operators`.
2. **No hay endpoint para productos empacados**: La API no permite marcar productos individuales como "packed". El checkbox de productos en el fulfillment es solo UI (no persiste en backend).
3. **Failed attempts no persisten en API**: Los estados `FAILED_ATTEMPT_1/2/3` y `FAILED_DELIVERY` no existen en la API (`/shipping` solo tiene `PENDING | PROCESSING | SHIPPED | DELIVERED`). Se mantienen en los tipos UI para futuras expansiones.
4. **Stock sin validación**: No se valida stock insuficiente antes de descontar. El API acepta cantidad 0 o negativa.
5. **Promociones no implementadas**: El backoffice no gestiona promociones.

---

## Próximos Pasos Sugeridos

1. **Agregar búsqueda y filtros avanzados** en `/shipments` (por fecha, cliente, método de envío).
2. **Exportar reportes** de envíos (CSV/Excel) para análisis operativo.
3. **Validación de stock insuficiente** antes de permitir completar empaque.
4. **Notificaciones por email** al cliente cuando el envío cambia de estado (la API ya envía emails en algunos endpoints, verificar cobertura).

---

## Notas de Build

- **Next.js 14.1.4** — App Router
- **Build exitoso**: 9 rutas, 0 errores TypeScript
- **Middleware activo**: Redirige usuarios no autenticados a `/login`

---

## 2025-05-21 — Server-Side Auth + SSR Data Fetching

### Contexto
El proyecto tenía dos problemas críticos:
1. **CORS**: El frontend en Docker (`localhost:3000`) no podía comunicarse con la API en Vercel (`api-virtualpet.vercel.app`) desde el browser debido a políticas de Same Origin y falta de headers `Access-Control-Allow-Origin`.
2. **Performance**: Las páginas protegidas (`/dashboard`, `/shipments`, etc.) llegaban vacías al browser y dependían de múltiples fetches client-side, causando pantallas en blanco de hasta 13 segundos en la primera carga.

Esta sesión migró la autenticación a cookies `httpOnly` y convirtió todas las páginas principales a **Server Components** con prefetch de datos e hidratación de React Query.

---

### Fase 1: Auth Infrastructure (Cookie-Based)

#### Decisiones Arquitectónicas

1. **API Proxy Local**: Todas las llamadas a la API externa ahora pasan por rutas internas de Next.js (`/api/proxy/*`, `/api/auth/*`). Esto elimina CORS completamente porque el browser solo habla con `localhost:3000`.
2. **Cookies `httpOnly`**: Los tokens ya no se guardan en `localStorage`. El proxy `/api/auth/login` recibe `accessToken` + `refreshToken` de la API externa y los almacena en cookies seguras (`httpOnly`, `SameSite=Lax`). El `apiClient` del lado del cliente nunca ve el token directamente.
3. **Middleware activado**: `middleware.ts` lee cookies (`vp_access_token`, `vp_refresh_token`) y redirige usuarios sin sesión a `/login` antes de que Next.js renderice la página.
4. **Fallback de refresh expirado (Opción A)**: Si un Server Component encuentra un `accessToken` expirado, no intenta refresh silencioso. Simplemente redirige a `/login` (`serverApi.ts` → `redirect('/login')`). El refresh silencioso sigue existiendo en el cliente (`apiClient.ts`).

#### Endpoints Proxy Creados

| Proxy Local | Método | Destino Vercel | Función |
|-------------|--------|----------------|---------|
| `/api/auth/login` | POST | `/auth/login` | Login + set cookies `httpOnly` |
| `/api/auth/logout` | POST | `/auth/logout` | Logout + clear cookies |
| `/api/auth/refresh` | POST | `/auth/refresh` | Refresh token + update cookies |
| `/api/auth/me` | GET | `/users/me` | Perfil del usuario autenticado |
| `/api/proxy/[...path]` | ANY | `/*` | Proxy genérico para todos los endpoints de datos |

#### Flujo de Autenticación (Nuevo)

```
Browser ──POST /api/auth/login──► Next.js Proxy ──POST /auth/login──► Vercel API
                                          │                              │
                                          │◄── { accessToken, refreshToken }┘
                                          │
                                   Set cookies httpOnly
                                          │
                                   Browser ya tiene sesión
                                   (cookie automática en cada request)
```

---

### Fase 2+3: SSR Data Fetching + Client Islands

#### Decisiones Arquitectónicas

1. **Hybrid SSR + React Query**: Las páginas ahora son Server Components que prefetchean datos en el servidor (usando `cookies()` para auth) y los inyectan al cliente vía `<HydrationBoundary>` de TanStack Query. Los componentes interactivos (filtros, paginación, tablas) siguen siendo Client Components.
2. **Eliminación de CORS**: Los Server Components hacen requests directamente a `https://api-virtualpet.vercel.app/api` desde Node.js (server-to-server), donde no existe Same Origin Policy. Los Client Components hablan con `/api/proxy/*` (same origin).
3. **Separación de responsabilidades**:
   - `page.tsx` → Server Component: prefetch de datos, auth check, dehydrate
   - `*-content.tsx` → Client Component: UI interactiva, React Query hooks, filtros

#### Páginas Refactorizadas

| Página | Server Prefetch | Client Content | Datos Iniciales |
|--------|-----------------|----------------|-----------------|
| `/dashboard` | `getServerShipments()` + `getServerIssues()` | `dashboard-content.tsx` | Contadores + tarjetas |
| `/shipments` | `getServerShipments({ page: 1, limit: 20 })` | `shipments-content.tsx` | Tabla + filtros |
| `/pending` | `getServerShipments({ status: 'PENDING', page: 1 })` | `pending-content.tsx` | Tabla pendientes |
| `/issues` | `getServerShipments({ status: 'CANCELLED', page: 1 })` | `issues-content.tsx` | Tabla cancelados |

---

### Fase 4: Layout Refactor (Server Component)

1. **`src/app/(dashboard)/layout.tsx`** convertido a **Server Component**.
2. Lógica de sidebar, navegación activa, y auth UI extraída a **`src/components/dashboard-nav.tsx`** (Client Component).
3. El layout del servidor simplemente renderiza `<DashboardNav>{children}</DashboardNav>`, sin ejecutar hooks en el servidor.

---

### Archivos Creados

- `src/lib/config.ts` — URL base de la API centralizada
- `src/lib/serverApi.ts` — `serverFetch()` para Server Components (lee cookies, 401 → redirect)
- `src/lib/serverData.ts` — Helpers `getServerShipments()` y `getServerIssues()`
- `src/lib/shipmentMappers.ts` — Mappers extraídos de `shipmentService.ts` para reutilización server/client
- `src/components/hydration-wrapper.tsx` — Bridge `<HydrationBoundary>` para SSR + React Query
- `src/components/dashboard-nav.tsx` — Sidebar + mobile nav (Client Component)
- `src/app/api/auth/login/route.ts` — Proxy de login con set cookies
- `src/app/api/auth/logout/route.ts` — Proxy de logout con clear cookies
- `src/app/api/auth/refresh/route.ts` — Proxy de refresh con update cookies
- `src/app/api/auth/me/route.ts` — Proxy de `/users/me`
- `src/app/api/proxy/[...path]/route.ts` — Proxy genérico para todos los endpoints de datos
- `src/app/(dashboard)/dashboard/dashboard-content.tsx` — UI del dashboard (Client)
- `src/app/(dashboard)/shipments/shipments-content.tsx` — UI de envíos (Client)
- `src/app/(dashboard)/pending/pending-content.tsx` — UI de pendientes (Client)
- `src/app/(dashboard)/issues/issues-content.tsx` — UI de incidencias (Client)

### Archivos Modificados

- `.env.local` — Agregado `/api` al final de `NEXT_PUBLIC_API_URL`
- `src/lib/apiClient.ts` — Ahora apunta a `/api/proxy/*` en vez de la URL externa directamente. Refresh a `/api/auth/refresh`. Removido `localStorage`.
- `src/lib/auth.ts` — Helpers de `localStorage` deprecados (ya no son source of truth). Mantenidos por compatibilidad transitoria.
- `src/services/authService.ts` — Ahora apunta a `/api/auth/*` en vez de la API externa directamente.
- `src/services/shipmentService.ts` — Mappers extraídos a `shipmentMappers.ts`.
- `src/hooks/useAuth.ts` — Removidas todas las llamadas a `localStorage`. `isAuthenticated` ahora se deriva de `!!user` (del hook `me`).
- `src/middleware.ts` — Descomentado y activado. Lee cookies en vez de `localStorage`.
- `src/app/(dashboard)/layout.tsx` — Convertido a Server Component.
- `src/app/(dashboard)/dashboard/page.tsx` — Convertido a Server Component con prefetch.
- `src/app/(dashboard)/shipments/page.tsx` — Convertido a Server Component con prefetch.
- `src/app/(dashboard)/pending/page.tsx` — Convertido a Server Component con prefetch.
- `src/app/(dashboard)/issues/page.tsx` — Convertido a Server Component con prefetch.

---

### Docker / Compose

- `docker-compose.yml` — Creado para levantar el contenedor con `.env.local` montado (`env_file: - .env.local`). Esto asegura que `NEXT_PUBLIC_API_URL` esté disponible en runtime.

---

### Estado Actual de Conectividad

| Feature | Estado | Ruta |
|---------|--------|------|
| Login / Logout | ✅ Proxy Local | `/api/auth/login`, `/api/auth/logout` |
| Perfil de usuario | ✅ Proxy Local | `/api/auth/me` |
| Silent token refresh | ✅ Proxy Local | `/api/auth/refresh` |
| Listar pedidos | ✅ SSR (server-to-server) | `getServerShipments()` |
| Detalle de pedido | ✅ SSR (server-to-server) | `serverFetch('/orders/:id')` |
| Actualizar estado de pedido | ✅ Proxy Local | `/api/proxy/orders/:id/status` |
| Crear envío | ✅ Proxy Local | `/api/proxy/shipping` |
| Obtener envío por orden | ✅ Proxy Local | `/api/proxy/shipping/orders/:orderId` |
| Actualizar estado de envío | ✅ Proxy Local | `/api/proxy/shipping/orders/:orderId/status` |
| Métodos de envío | ✅ Proxy Local | `/api/proxy/shipping/methods` |
| Estado de pago | ✅ Proxy Local | `/api/proxy/payment/orders/:orderId` |
| Middleware de autenticación | ✅ Activo | `middleware.ts` |

---

### Limitaciones Conocidas / Deuda Técnica (Actualizadas)

1. **Token refresh en Server Components**: Si el `accessToken` expira mientras el usuario navega entre páginas protegidas, el Server Component redirige a `/login` en vez de refrescar silenciosamente. El cliente (`apiClient.ts`) sí hace refresh silencioso. Una mejora futura sería intentar refresh desde el servidor usando `vp_refresh_token` antes de redirigir.
2. **localStorage legacy**: `src/lib/auth.ts` aún contiene helpers de `localStorage` por compatibilidad transitoria. Se pueden remover en una sesión futura una vez confirmado que nada depende de ellos.
3. **SameSite=Lax**: Las cookies usan `SameSite=Lax`. Esto funciona para navegación normal, pero si se necesita hacer requests cross-site desde iframes o POSTs externos, debería cambiarse a `SameSite=None; Secure`.

---

## Notas de Build

- **Next.js 14.1.4** — App Router
- **Build exitoso**: 9 rutas, 0 errores TypeScript
- **Middleware activo**: Redirige usuarios no autenticados a `/login`

## 2025-05-21 — Full Server Components Migration + RSC Optimization
### Contexto
El proyecto utilizaba un patrón híbrido donde las páginas eran Server Components que solo servían para hidratar Client Components vía `<HydrationBoundary>` de React Query. Esto generaba:
1. **Bundle innecesariamente grande**: Todo el código de fetching y estado se enviaba al cliente.
2. **Pantallas de carga client-side**: Las páginas llegaban vacías al browser y dependían de `useEffect` para fetchear datos.
3. **Seguridad subóptima**: El token JWT se manejaba parcialmente en el cliente.
Esta sesión migró todas las páginas principales a **Server Components puros (RSC)**, moviendo el data fetching al servidor, eliminando React Query hydration donde no era necesario, y delegando solo los elementos realmente interactivos a Client Components pequeños.
---
### Decisiones Arquitectónicas
1. **Páginas como Server Components async**: Todas las páginas de lista (`/dashboard`, `/shipments`, `/pending`) ahora fetchean datos directamente en el servidor usando `serverFetch()`, leyendo el JWT desde `cookies()` de forma automática.
2. **Eliminación de React Query Hydration**: Removidos `QueryClient`, `dehydrate`, `HydrationWrapper` y todos los `*-content.tsx` intermedios. Los datos fluyen directamente de la función `page.tsx` a los componentes hijos vía props.
3. **Interacciones aisladas en Client Components mínimos**:
   - `ShipmentsFilterBar`: solo manipula query params (`?status=...`) en la URL.
   - `UrlPagination`: solo manipula query params (`?page=...`) en la URL.
   - `ShipmentsTable`: mantiene `@tanstack/react-table` para sorting client-side.
   - `FulfillmentChecklist`: conserva estados locales (checkboxes, selects, dialogs) y mutaciones.
4. **Ruta protegida automática**: `serverApi.ts` ya maneja `401` con `redirect('/login')`, por lo que no es necesario repetir lógica de auth en cada página.
---
### Fase 1: Server Data Helpers
- **`src/lib/serverData.ts`**:
  - Agregado `getServerUser()` → `serverFetch('/users/me')`
  - Agregado `getServerShipmentById(id)` → obtiene order + shipping record en paralelo y mapea a `Shipment`
- **`src/types/shipment.ts`**:
  - Agregada interfaz `ShipmentsResponse` (faltaba en el proyecto)
---
### Fase 2: Dashboard Shell (`layout.tsx` + `dashboard-nav.tsx`)
- **`src/app/(dashboard)/layout.tsx`** → Convertido a Server Component `async`. Obtiene usuario con `getServerUser()` y lo pasa como prop.
- **`src/components/dashboard-nav.tsx`** → Mantiene `'use client'` (necesita `usePathname` para links activos). Eliminado hook `useAuth`; ahora recibe `user: User | null` como prop. Logout directo con `authService.logout()` + `router.push('/login')`.
---
### Fase 3: Dashboard Page
- **`src/app/(dashboard)/dashboard/page.tsx`** → Server Component puro. Obtiene `shipments` y pasa datos directamente.
- **`src/app/(dashboard)/dashboard/dashboard-content.tsx`** → Eliminado `'use client'`. Ahora es Server Component que recibe `shipments` como prop. Renderiza cards estáticas + links.
---
### Fase 4: List Pages (`shipments`, `pending`)
- **`src/app/(dashboard)/shipments/page.tsx`** → Server Component con `searchParams`. Lee `searchParams.status` y `searchParams.page`, fetchea con `getServerShipments()`, renderiza `ShipmentsFilterBar` + `ShipmentsTable` + `UrlPagination`.
- **`src/app/(dashboard)/pending/page.tsx`** → Server Component con `searchParams.page`; status fijo `PENDING`.
- **Nuevos componentes cliente**:
  - `src/components/shipments/shipments-filter-bar.tsx` — Botones de filtro que actualizan `?status=...` en URL.
  - `src/components/ui/url-pagination.tsx` — Paginación que actualiza `?page=...` en URL.
- **Eliminados**:
  - `shipments-content.tsx`, `pending-content.tsx`
  - `src/components/hydration-wrapper.tsx`
  - `src/hooks/useShipments.ts`, `src/hooks/useIssues.ts`
---
### Fase 5: Fulfillment Page (`shipments/[id]/fulfill`)
- **`src/app/(dashboard)/shipments/[id]/fulfill/page.tsx`** → Convertido a Server Component `async`.
  - Obtiene `shipment` con `getServerShipmentById(params.id)`.
  - Obtiene `payment` con `serverFetch` directo.
  - Renderiza en servidor: Header, Timeline, Customer Info, Shipping Info, Cancelled Warning.
  - Delega parte interactiva a `<FulfillmentChecklist shipment={shipment} />`.
- **`src/components/shipments/fulfillment-checklist.tsx`** → Refactorizado.
  - Eliminadas todas las secciones estáticas (ahora renderizadas en el server page).
  - Conserva solo: Progress bar, Product Checklist (checkboxes), Actions Panel, Discrepancy Dialog.
---


### Fase 8: Limpieza de Tipos Huérfanos

- **Eliminados de `src/types/shipment.ts`**:
  - `ACTIVE_STATUSES` — Array redundante (incluía todos los statuses); nadie lo importaba.
  - `ISSUE_STATUSES` — Página de incidencias eliminada previamente.
  - `LogisticsType` — Hardcoded (`INTERNAL_DELIVERY`, `COURIER_1`, `COURIER_2`); reemplazado por `ShippingMethod` dinámico de la API.
  - `LOGISTICS_LABELS` — Labels del tipo hardcoded; sin consumidores.
  - `FulfillmentPayload` — Interface del flujo antiguo; el fulfillment ahora muta directamente.

---

## Notas de Build

- **Next.js 14.1.4** — App Router
- **Build exitoso**: 12 rutas, 0 errores TypeScript
- **Middleware activo**: Redirige usuarios no autenticados a `/login`
