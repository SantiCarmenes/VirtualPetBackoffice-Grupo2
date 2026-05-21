# Changelog — VirtualPet Backoffice

## 2025-05-21 — Complete Server-First Refactor + Secure Auth + Aligned Schemas

### Contexto
El proyecto tenía problemas críticos de arquitectura:
1. **Token storage inseguro**: Los tokens JWT se almacenaban en `localStorage`, accesibles por XSS.
2. **Data fetching client-side masivo**: Todas las páginas dependían de múltiples `useEffect` y TanStack Query hooks, causando pantallas en blanco y carga lenta.
3. **Schemas desalineados**: El frontend creaba tipos propios (`ShipmentStatus`, `Shipment`) que mapeaban y renombraban campos del backend arbitrariamente.
4. **Middleware inactivo**: La protección de rutas estaba comentada.
5. **Sin state machine**: Las transiciones de estado de pedidos no estaban controladas en el frontend.

Esta sesión migró completamente la aplicación a una arquitectura **Server-First** con **HTTPOnly cookies**, **Server Components puros**, y **tipos alineados al backend**.

---

### Decisiones Arquitectónicas

1. **HTTPOnly Cookies**: Eliminado `localStorage`. Los tokens `vp_access_token` y `vp_refresh_token` se almacenan en cookies `httpOnly`, `SameSite=Lax`, `Secure` en producción.
2. **Middleware activo con auto-refresh**: `middleware.ts` intercepta rutas protegidas. Si el `accessToken` expiró pero existe `refreshToken`, intenta refresh automático antes de redirigir.
3. **Server Components puros**: Todas las páginas principales (`/dashboard`, `/orders`, `/pending`) son Server Components `async` que fetchean datos directamente en el servidor.
4. **Tipos alineados al backend**: Eliminado `ShipmentStatus` y `Shipment`. Ahora se usa `OrderStatus` (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED) y la interfaz `Order` exactamente como la API la devuelve.
5. **State machine en el frontend**: Implementadas transiciones dirigidas:
   - PENDING → CONFIRMED | CANCELLED
   - CONFIRMED → SHIPPED | CANCELLED
   - SHIPPED → DELIVERED | CANCELLED
   - DELIVERED / CANCELLED → terminal
6. **Dashboard con KPIs server-side**: El dashboard fetchea todos los pedidos y computa contadores en el servidor antes de renderizar, con caché de 20 minutos (`revalidate: 1200`).
7. **Paginación vía URL**: Las páginas de lista usan `?page=X` resuelto en el servidor, preservando estado en la URL.
8. **Client Components mínimos**: Solo los elementos que requieren interacción inmediata (filtros, tablas con sorting, formularios, dialogs) son Client Components.

---

### Archivos Creados

- `src/types/order.ts` — Tipos alineados al backend (`Order`, `OrderStatus`, `OrderItem`, `ShippingRecord`, `ShippingMethod`, `Payment`, `Warehouse`, `User`)
- `src/lib/serverData.ts` — Helpers de data fetching server-side (`getServerOrders`, `getServerOrderById`, `getServerUser`, `getServerShippingRecord`, `getServerPayment`, `getServerWarehouses`, `getServerUsers`, `getServerShippingMethods`)
- `src/app/(dashboard)/orders/page.tsx` — Página de pedidos (Server Component)
- `src/app/(dashboard)/orders/[id]/fulfill/page.tsx` — Página de preparación/fulfillment (Server Component)
- `src/components/orders/orders-table.tsx` — Tabla de pedidos con sorting y acciones de estado (Client Component)
- `src/components/orders/orders-filter-bar.tsx` — Barra de filtros por estado (Client Component)
- `src/components/orders/status-badge.tsx` — Badge de estado de pedido
- `src/components/orders/fulfillment-checklist.tsx` — Checklist de preparación con acciones (Client Component)
- `REFACTOR.md` — Plan completo de refactoring

### Archivos Eliminados

- `src/types/shipment.ts` — Reemplazado por `order.ts`
- `src/lib/shipmentMappers.ts` — Ya no se necesita mapeo
- `src/lib/auth.ts` — Lógica de localStorage obsoleta
- `src/hooks/*.ts` — Todos los hooks de data fetching client-side eliminados
- `src/services/fulfillmentService.ts` — Reemplazado por llamadas directas
- `src/services/shipmentService.ts` — Obsoleto
- `src/services/stockService.ts` — Obsoleto
- `src/components/shipments/*` — Reemplazados por `components/orders/*`
- `src/components/ui/pagination.tsx` — Reemplazado por `url-pagination.tsx`
- `src/app/(dashboard)/dashboard/dashboard-content.tsx` — Dashboard ahora inline en page.tsx

### Archivos Modificados

- `src/middleware.ts` — Activado con route protection y auto-refresh
- `src/lib/serverApi.ts` — Mejorado con manejo de cookies y caching tags
- `src/lib/apiClient.ts` — Actualizado a tipos `order.ts`
- `src/lib/config.ts` — URL de API centralizada
- `src/app/(dashboard)/layout.tsx` — Server Component que pasa usuario al nav
- `src/app/(dashboard)/dashboard/page.tsx` — Server Component con KPIs computados server-side
- `src/app/(dashboard)/pending/page.tsx` — Server Component simplificado
- `src/app/(dashboard)/shipments/page.tsx` — Redirección a `/orders`
- `src/app/(dashboard)/shipments/[id]/fulfill/page.tsx` — Redirección a `/orders/[id]/fulfill`
- `src/app/login/page.tsx` — Login como Client Component con `useState` y `router.refresh()`
- `src/app/layout.tsx` — Lang cambiado a `es`
- `src/components/dashboard-nav.tsx` — Actualizado links a `/orders`, `/pending`
- `src/services/authService.ts` — Conectado a `/api/auth/*`
- `src/services/orderService.ts` — Simplificado, usa `OrderStatus`
- `src/services/shippingService.ts` — Simplificado
- `src/services/paymentService.ts` — Simplificado
- `src/services/userService.ts` — Simplificado
- `src/services/warehouseService.ts` — Simplificado
- `src/app/api/auth/login/route.ts` — Set cookies httpOnly
- `src/app/api/auth/logout/route.ts` — Clear cookies
- `src/app/api/auth/refresh/route.ts` — Update cookies
- `src/app/api/auth/me/route.ts` — Proxy a `/users/me`
- `src/app/api/proxy/[...path]/route.ts` — Proxy genérico con auth header desde cookies
- `tsconfig.json` — Revertido include a estándar

---

### Estado de Conectividad

| Feature | Estado | Ruta |
|---------|--------|------|
| Login / Logout | ✅ Proxy Local | `/api/auth/login`, `/api/auth/logout` |
| Perfil de usuario | ✅ Proxy Local | `/api/auth/me` |
| Silent token refresh | ✅ Middleware + Proxy | `middleware.ts` + `/api/auth/refresh` |
| Listar pedidos | ✅ SSR | `getServerOrders()` |
| Detalle de pedido | ✅ SSR | `getServerOrderById()` |
| Actualizar estado de pedido | ✅ Client + Proxy | `/api/proxy/orders/:id/status` |
| Crear envío | ✅ Client + Proxy | `/api/proxy/shipping` |
| Obtener envío por orden | ✅ SSR | `getServerShippingRecord()` |
| Actualizar estado de envío | ✅ Client + Proxy | `/api/proxy/shipping/orders/:orderId/status` |
| Métodos de envío | ✅ SSR | `getServerShippingMethods()` |
| Estado de pago | ✅ SSR | `getServerPayment()` |
| Middleware de autenticación | ✅ Activo | `middleware.ts` |

---

### Notas de Build

- **Next.js 14.1.4** — App Router
- **Build exitoso**: 13 rutas, 0 errores TypeScript
- **Middleware activo**: Redirige usuarios no autenticados a `/login` y hace auto-refresh de tokens

