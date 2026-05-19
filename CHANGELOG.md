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

