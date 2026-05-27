<p align="center">
  <a href="https://nextjs.org/" target="blank"><img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" width="80" alt="Next.js Logo" /></a>
</p>

<p align="center">
  <b>VirtualPet — Backoffice</b><br/>
  Internal operations panel built with <a href="https://nextjs.org/" target="_blank">Next.js 14</a> (App Router). Manages orders, fulfillment, and delivery lifecycle.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript 5"/>
  <img src="https://img.shields.io/badge/Tailwind-3-38BDF8" alt="Tailwind CSS 3"/>
</p>

## Description

Internal backoffice for the VirtualPet platform. Allows operations staff to manage the full order lifecycle: receive orders, prepare and pack items, dispatch shipments, confirm delivery, and handle failed delivery retries.

**Pages:**

| Route | Description |
|-------|-------------|
| `/dashboard` | KPI summary — orders by status |
| `/orders` | Full order list with status filters and pagination |
| `/orders/[id]/fulfill` | Order detail with fulfillment checklist and status actions |
| `/pending` | Filtered view of orders pending preparation |

## Stack

- **Framework:** Next.js 14 — App Router, Server Components, Server Actions
- **Auth:** JWT via httpOnly cookies (access token 15 min + refresh token 7 days with rotation). Silent refresh in middleware and server-side fetch layer.
- **UI:** Tailwind CSS 3, Radix UI primitives, Lucide icons, Sonner toasts
- **Tables:** TanStack React Table v8
- **API:** Proxy route (`/api/proxy/[...path]`) forwards authenticated requests to the backend REST API

## Project setup

```bash
$ npm install
```

## Environment variables

Create a `.env.local` file at the project root:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Run the project

```bash
# Development
$ npm run dev

# Build for production
$ npm run build

# Start production server
$ npm start
```

The app runs on `http://localhost:3000` by default.

## Auth flow

All pages under `/dashboard`, `/orders`, and `/pending` are protected. The middleware intercepts every request:

1. If the `access_token` cookie is absent but a `refresh_token` exists, the middleware calls the backend refresh endpoint and sets new cookies transparently.
2. If the refresh token is invalid, cookies are cleared and the user is redirected to `/login`.
3. Server-side data fetching (`serverFetch`) also retries on `401` with the refresh token before redirecting to login.
4. Client-side fetching (`apiClient`) handles `401` the same way through the `/api/auth/refresh` proxy route.

## Deployment — Vercel

The app is deployed on **Vercel**. Every push to `main` triggers an automatic deploy.

Set the following environment variable in the Vercel project settings:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

To deploy manually:

```bash
$ npx vercel --prod
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [TanStack Table](https://tanstack.com/table/latest)
- [Radix UI](https://www.radix-ui.com)
