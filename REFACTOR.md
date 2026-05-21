# Virtual Pet Backoffice Refactoring Plan

## Executive Summary

This document outlines the complete refactoring plan for the Virtual Pet Backoffice Next.js 14 application. The primary goals are to maximize Server-Side execution, implement secure HTTPOnly cookie-based token management, align data schemas with the backend API, and implement a strict state machine for order status transitions.

## Current Architecture Violations Identified

### 1. Authentication & Token Management
- **Violation**: `src/hooks/useAuth.ts` uses `useQuery` and client-side fetching for authentication state
- **Violation**: Login page (`src/app/login/page.tsx`) is a Client Component with form state managed via `useState`
- **Current State**: API routes already use HTTPOnly cookies (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`)
- **Missing**: `src/middleware.ts` has route protection commented out and no automatic token refresh
- **Action Required**: 
  - Keep login form as Client Component (it requires browser interactivity)
  - Keep authService that calls `/api/auth/login` route handler
  - Fix middleware to enforce route protection and handle automatic refresh
  - Ensure no localStorage token access anywhere

### 2. Data Fetching Architecture
- **Violation**: `src/hooks/useShipping.ts`, `src/hooks/useUsers.ts`, `src/hooks/useWarehouses.ts`, `src/hooks/useShippingMethods.ts` fetch data client-side via TanStack Query
- **Violation**: `src/components/shipments/fulfillment-checklist.tsx` fetches shipping methods, users, warehouses client-side via hooks
- **Violation**: `src/lib/apiClient.ts` is a client-side fetch wrapper that goes through `/api/proxy` - this adds unnecessary indirection for data that should be fetched server-side
- **Action Required**: 
  - Remove data-fetching hooks (useShipping, useUsers, useWarehouses, useShippingMethods)
  - Fetch reference data (users, warehouses, shipping methods) server-side in pages
  - Keep `apiClient` only for client-side mutations (update status, create shipping)
  - Use `serverFetch` for all server-side data needs

### 3. Backend Schema Alignment
- **Violation**: `src/types/shipment.ts` defines `ShipmentStatus` with frontend-only statuses (FAILED_ATTEMPT_1, FAILED_ATTEMPT_2, FAILED_ATTEMPT_3, FAILED_DELIVERY, MISSING_STOCK, IN_TRANSIT)
- **Violation**: `src/lib/shipmentMappers.ts` arbitrarily renames backend fields (`orderId: order.id.slice(0, 8).toUpperCase()`, `sku: item.variantId.slice(0, 8).toUpperCase()`)
- **Violation**: The `Shipment` type adds computed/transformed fields that don't exist in backend
- **Backend Reality**: Orders have statuses: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- **Action Required**:
  - Remove `ShipmentStatus` entirely
  - Use `OrderStatus` (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED) everywhere
  - Remove shipmentMappers.ts - use backend schemas directly
  - Remove `Shipment` type - use `Order` directly
  - Update all components to use `Order` fields directly

### 4. Dashboard & KPIs
- **Violation**: `src/app/(dashboard)/dashboard/page.tsx` fetches shipments and passes to `DashboardContent` which computes counts client-side
- **Current State**: Dashboard computes PENDING, IN_TRANSIT, DELIVERED counts from shipment data
- **Action Required**:
  - Fetch orders server-side in dashboard page
  - Compute KPIs server-side before rendering
  - Use Next.js fetch caching with `revalidate: 1200` and tags `['dashboard-metrics']`
  - KPIs:
    - Total Orders Count
    - Pending/Confirmed queue (PENDING + CONFIRMED)
    - In-Transit (SHIPPED)
    - Finalized (DELIVERED + CANCELLED)

### 5. Orders Management (Shipments/Pending Pages)
- **Violation**: `src/app/(dashboard)/shipments/page.tsx` and `src/app/(dashboard)/pending/page.tsx` use `getServerShipments` which maps/transforms data
- **Violation**: Status filtering uses `ShipmentStatus` mapped to `OrderStatus`
- **Violation**: Pagination state is in URL but uses mapped/transformed data
- **Action Required**:
  - Use `GET /orders/all?page=X&limit=20` directly with `OrderStatus` filter
  - Remove all mapping layers
  - Keep URL-based pagination (already implemented correctly)
  - Update table columns to use `Order` fields
  - Implement state machine for status transitions:
    - PENDING → CONFIRMED or CANCELLED
    - CONFIRMED → SHIPPED or CANCELLED
    - SHIPPED → DELIVERED or CANCELLED
    - DELIVERED/CANCELLED are terminal

### 6. Fulfillment Page
- **Violation**: `src/app/(dashboard)/shipments/[id]/fulfill/page.tsx` fetches payment client-side... wait, it actually fetches server-side. But it passes `shipment` (mapped data) to `FulfillmentChecklist`
- **Violation**: `FulfillmentChecklist` fetches shipping record, shipping methods, users, warehouses all client-side via TanStack Query hooks
- **Action Required**:
  - Convert fulfill page to fetch order, shipping record, payment, shipping methods, users, warehouses all server-side
  - Pass raw data to FulfillmentChecklist
  - FulfillmentChecklist becomes a Client Component only for interactions (form state, mutations)
  - Use Server Actions for mutations or keep API client for mutations

### 7. Navigation
- **Violation**: `src/components/dashboard-nav.tsx` is a Client Component that fetches nothing but uses `usePathname` and `useRouter`
- **Current State**: Dashboard layout fetches user server-side and passes to nav
- **Action Required**:
  - Keep nav as Client Component (it needs `usePathname` for active state)
  - Keep logout as client-side action calling `/api/auth/logout`
  - This is acceptable per requirements

## Target Architecture

### Directory Structure
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Server layout, fetches user
│   │   ├── page.tsx                # Redirect to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Server page, fetches orders, computes KPIs
│   │   ├── orders/
│   │   │   └── page.tsx            # Server page, fetches orders with pagination
│   │   └── shipments/              # Kept for URL compatibility, redirects to /orders
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Already HTTPOnly cookies ✓
│   │   │   ├── refresh/route.ts    # Already HTTPOnly cookies ✓
│   │   │   ├── logout/route.ts     # Already HTTPOnly cookies ✓
│   │   │   └── me/route.ts         # Already HTTPOnly cookies ✓
│   │   └── proxy/[...path]/        # Keep for client-side mutations
│   ├── login/
│   │   └── page.tsx                # Client Component form → server action
│   ├── layout.tsx                  # Root layout
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn components
│   ├── orders/
│   │   ├── orders-table.tsx        # Client Component with sorting
│   │   ├── orders-filter-bar.tsx   # Client Component for status filters
│   │   └── status-badge.tsx        # Server/Client component for OrderStatus
│   └── dashboard-nav.tsx           # Client Component (needs usePathname)
├── lib/
│   ├── serverApi.ts                # Server-side fetch with auth
│   ├── apiClient.ts                # Client-side fetch for mutations only
│   ├── config.ts                   # API_BASE_URL
│   └── utils.ts
├── types/
│   └── order.ts                    # Aligned with backend schemas
└── middleware.ts                   # Route protection + auto refresh
```

### Type System (Aligned with Backend)
```typescript
// OrderStatus exactly as backend defines it
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

// Order from GET /orders/:id and GET /orders/all
export interface Order {
  id: string
  userId: string
  status: OrderStatus
  customerEmail: string
  customerName: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  createdAt: string
}

// OrderItem from backend
export interface OrderItem {
  id: string
  variantId: string
  quantity: number
  unitPrice: number
  lineTotal: number
  productNameSnapshot: string
}

// ShippingAddress from backend
export interface ShippingAddress {
  street?: string
  city?: string
  province?: string
  postalCode?: string
}

// Paginated response from GET /orders/all
export interface OrdersResponse {
  data: Order[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// User from GET /users/me
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: 'USER' | 'BACKOFFICE'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ShippingRecord from GET /shipping/orders/:orderId
export interface ShippingRecord {
  id: string
  orderId: string
  methodId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

// ShippingMethod from GET /shipping/methods
export interface ShippingMethod {
  id: string
  name: string
  description: string
  cost: number
  estimatedDays: number
  active: boolean
}

// Payment from GET /payment/orders/:orderId
export interface Payment {
  id: string
  orderId: string
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER'
  amount: string
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED'
  createdAt: string
  updatedAt: string
}

// Warehouse from GET /warehouses
export interface Warehouse {
  id: string
  name: string
  code: string
  address: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
```

### State Machine
```typescript
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
}

export function getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false
}
```

### Server-Side Data Fetching
```typescript
// src/lib/serverApi.ts - enhanced
export async function serverFetch<T>(
  path: string,
  config: RequestInit = {}
): Promise<T> {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('vp_access_token')?.value
  
  const url = `${API_BASE_URL}${path}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string> || {}),
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  const response = await fetch(url, {
    ...config,
    headers,
    // Cache configuration for dashboard metrics
    ...(config.next || {}),
  })
  
  if (response.status === 401) {
    redirect('/login')
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Error HTTP: ${response.status}`)
  }
  
  if (response.status === 204) {
    return undefined as T
  }
  
  return response.json() as T
}
```

### Dashboard KPI Computation
```typescript
// Server-side in dashboard page
const orders = await getServerOrders({ limit: 10000 }) // Fetch all for metrics

const kpis = {
  total: orders.pagination.total,
  pending: orders.data.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
  inTransit: orders.data.filter(o => o.status === 'SHIPPED').length,
  finalized: orders.data.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED').length,
}
```

### Client-Side Mutations
For status updates and shipping record creation, use:
1. Server Action (preferred for Next.js 14) OR
2. API client calling `/api/proxy/...` with revalidation

Since the current code uses API proxy, keep it for mutations but add `revalidatePath` after mutations.

Actually, the prompt says to use Server Actions. Let's implement Server Actions for mutations.

## Implementation Order

1. **Types & Constants** - Rewrite `src/types/order.ts` with aligned schemas
2. **Middleware** - Fix route protection and auto-refresh
3. **Server API** - Enhance with caching tags
4. **Auth** - Keep current API routes (they already use HTTPOnly cookies)
5. **Dashboard** - Rewrite as pure server component with KPI computation
6. **Orders Page** - Rewrite with URL pagination and OrderStatus filtering
7. **Orders Table** - Rewrite to use Order type directly with state machine actions
8. **Fulfillment Page** - Server-side data fetching, client-side interactions only
9. **Cleanup** - Remove unused files (shipmentMappers.ts, old hooks, old types)
10. **Navigation** - Update links from /shipments to /orders where appropriate

## File Changes Summary

### New Files
- `src/types/order.ts` - Aligned types
- `src/lib/orderStateMachine.ts` - State machine logic
- `src/app/(dashboard)/orders/page.tsx` - New orders list page
- `src/components/orders/orders-table.tsx` - Orders table with state machine
- `src/components/orders/orders-filter-bar.tsx` - Status filter
- `src/components/orders/status-badge.tsx` - Order status badge

### Modified Files
- `src/middleware.ts` - Enable route protection + refresh
- `src/lib/serverApi.ts` - Add caching tags
- `src/app/(dashboard)/layout.tsx` - Pass user to nav
- `src/app/(dashboard)/dashboard/page.tsx` - Server-side KPIs
- `src/app/login/page.tsx` - Keep as client component (required for form)
- `src/components/dashboard-nav.tsx` - Update nav items
- `src/lib/apiClient.ts` - Keep for client mutations only

### Deleted Files
- `src/types/shipment.ts` - Replaced by order.ts
- `src/lib/shipmentMappers.ts` - No longer needed
- `src/lib/serverData.ts` - Replaced by direct server fetches
- `src/hooks/useAuth.ts` - Replaced by server auth
- `src/hooks/useShipping.ts` - Not needed (server fetch)
- `src/hooks/useShippingMethods.ts` - Not needed (server fetch)
- `src/hooks/useUsers.ts` - Not needed (server fetch)
- `src/hooks/useWarehouses.ts` - Not needed (server fetch)
- `src/hooks/usePayment.ts` - Not needed (server fetch)
- `src/hooks/useCreateShipping.ts` - Merge into checklist
- `src/hooks/useCreateShippingRecord.ts` - Merge into checklist
- `src/hooks/useUpdateShippingStatus.ts` - Merge into checklist
- `src/hooks/useFulfillmentMutation.ts` - Merge into checklist
- `src/services/fulfillmentService.ts` - Replaced by direct API calls
- `src/services/orderService.ts` - Simplified
- `src/services/shipmentService.ts` - Not needed
- `src/components/shipments/shipments-table.tsx` - Replaced
- `src/components/shipments/shipments-filter-bar.tsx` - Replaced
- `src/components/shipments/status-badge.tsx` - Replaced
- `src/components/shipments/fulfillment-checklist.tsx` - Rewritten
- `src/components/ui/pagination.tsx` - May be unused
- `src/app/(dashboard)/shipments/page.tsx` - Replaced/redirected
- `src/app/(dashboard)/pending/page.tsx` - Replaced/redirected
- `src/app/(dashboard)/shipments/[id]/fulfill/page.tsx` - Rewritten
- `src/app/(dashboard)/dashboard/dashboard-content.tsx` - Replaced by inline

### Kept Files (with minor updates)
- `src/app/api/auth/*` - Already correct with HTTPOnly cookies
- `src/app/api/proxy/[...path]/route.ts` - Keep for client mutations
- `src/services/authService.ts` - Keep for login/logout
- `src/services/shippingService.ts` - Simplify
- `src/services/userService.ts` - Simplify
- `src/services/warehouseService.ts` - Simplify
- `src/services/paymentService.ts` - Simplify
- `src/lib/queryClient.ts` - Keep for TanStack Query (used by mutations)
- `src/app/providers.tsx` - Keep
- `src/app/layout.tsx` - Keep
- `src/app/globals.css` - Keep
- `src/components/ui/*` - Keep shadcn components

## Risks & Mitigations

1. **Breaking URL changes**: /shipments and /pending will change to /orders with filters
   - Mitigation: Add redirects or keep old URLs working
   
2. **State machine strictness**: Users may expect more flexible status changes
   - Mitigation: Backend validates anyway, show clear error messages

3. **Performance**: Fetching all orders for dashboard KPIs
   - Mitigation: Use caching with 20-minute revalidation, backend pagination for list views

4. **Type safety during transition**: Mixing old and new types
   - Mitigation: Complete type replacement in one pass, TypeScript will catch errors

## Conclusion

This refactoring will transform the application from a client-side data-heavy architecture to a true Next.js 14 Server-First application. The key wins are:
- All data fetching moves to server components
- Token management is fully secure with HTTPOnly cookies
- Backend schemas are respected without arbitrary transformations
- Dashboard KPIs are computed server-side with intelligent caching
- Order status transitions follow a strict, well-defined state machine
- Client components are minimized to only interactive UI elements
