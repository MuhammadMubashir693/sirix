# Sirix Frontend — Telecom Carrier Management Platform

React 19 + TypeScript + Vite frontend, built module by module to match the Sirix backend.

## Status: Module 2 of 8 — Shared Architecture + Authentication + Admin ✅

### Design system
- **Theme**: modern SaaS dashboard — white background, soft gray surfaces, blue accent, rounded cards (per brief)
- **Type system**: Inter (body/UI), Lexend (display/headings), JetBrains Mono (numeric/data — rates, IDs, SIP codes read as data throughout the app)
- **Signature element**: an animated signal-bar field on the auth screens' brand panel — a restrained nod to the carrier/telecom domain
- Tailwind v4 (CSS-first config, tokens in `src/index.css`), shadcn-style primitives built on Radix

### Shared architecture (used by every future module)
- `lib/apiClient.ts` — Axios instance with request/response interceptors, **automatic access-token refresh with request queuing** (concurrent 401s wait on one in-flight refresh instead of each firing their own), normalized error shape
- `services/tokenService.ts` — framework-agnostic token storage; "remember me" controls localStorage vs sessionStorage
- `store/` — Zustand: `authStore`, `themeStore`, `notificationStore`
- `lib/queryClient.ts` — React Query defaults (no retry on 4xx, retry twice on network/5xx)
- `routes/` — `ProtectedRoute` / `PublicRoute` guards, lazy-loaded pages, router config
- `components/ui/` — Button, Input, Label, Card (cva + Radix, shadcn conventions)
- `components/common/` — LoadingSpinner, ErrorBoundary, StatusPage (404/401/network-error base), OfflineIndicator
- `components/forms/` — PasswordInput, FormField wrapper
- `layouts/` — `AuthLayout` (split-screen, signature visual), `AppLayout` (sidebar + header shell for all authenticated modules)

### Authentication module
Pages: Login, Forgot Password, Reset Password, Change Password — all built on `react-hook-form` + Zod, wired to React Query mutations in `features/auth/hooks/useAuth.ts`, calling `api/auth.ts` against the backend's 8 `/auth/*` endpoints.

Also included: a minimal Dashboard placeholder page (confirms auth/routing/shell work end-to-end) and a Sidebar with the other modules listed but disabled, ready to light up as they ship.

### Admin module
Route: `/admin` (redirects to `/admin/users`), guarded by `RequirePermission` (mirrors the backend's `authorizePermission` — the `Admin` role always passes, others need the matching permission key) and nested inside `AppLayout`/`ProtectedRoute` like every other authenticated route.

Pages, all under `features/admin/pages/` with a shared tab layout (`AdminLayout.tsx`):
- **Users** — searchable/paginated table, create/edit dialog with role picker, activate/deactivate, soft delete (self-service actions on your own account are disabled in the UI)
- **Roles** — list with permission counts, create/edit dialog with permissions grouped by module as checkboxes, delete blocked client-side text matches the backend's guardrails (built-in roles, roles still in use)
- **Permissions** — read-only catalog grouped by module, create a custom permission, delete when unused
- **Sessions** — active refresh-token sessions across all users, per-session revoke
- **Audit Logs** — paginated, filterable (search, module) read-only trail
- **Settings** — grouped key/value system settings, typed (string/number/boolean/json), create/edit/delete

All built on `react-hook-form` + Zod (`features/admin/schemas.ts`), wired to React Query hooks in `features/admin/hooks/`, calling `api/admin.ts` against the backend's `/admin/*` endpoints. New shared primitives added to support this: `components/ui/dialog.tsx`, `select.tsx`, `badge.tsx`, `textarea.tsx`, `switch.tsx`, plus admin-local `PaginationControl` and `ConfirmDialog`.

## Getting started

```bash
cp .env.example .env
npm install
npm run dev            # http://localhost:3000
```

By default the Vite dev server proxies `/api` to `VITE_API_PROXY_TARGET` (defaults to `http://localhost:5000`) — see `vite.config.ts`. Point this at your running backend.

### Docker

```bash
docker compose up frontend
```

> Uses Docker Compose v2 (the `docker compose` CLI plugin) — not the old standalone `docker-compose` binary.

This starts the dev server in a container on port 3000. To run the production build behind nginx instead:

```bash
docker compose --profile prod up frontend-prod   # http://localhost:8080
```

Both services join an external `sirix-network` so the frontend container can reach the backend by its service name (`backend`). Create the network once — the backend's `docker compose up` already creates it — or manually:
```bash
docker network create sirix-network
```

### Images used
- `node:lts` — current Node.js **Active LTS** line (Node 22 is Maintenance LTS, Node 26 is Current/non-LTS until October 2026)
- `nginx:latest` — latest stable, per your preference for the web server tier

## Verification performed
- `npx tsc -b` — clean, no type errors
- `npx vite build` — succeeds, route-based code splitting confirmed (each page, including every Admin page, is its own lazy chunk)
- `npx eslint . --ext .ts,.tsx` — 0 errors (a few harmless "fast refresh" / React Compiler memoization warnings, consistent with the ones already present in the auth module)

## Not yet built (upcoming modules)
2. Relationship Performance
3. Numbering
4. Call Diagnostics
5. Accounting
6. Reports
7. Dashboard (full version — cards, charts, live Socket.io updates)

Each will follow the same feature-folder pattern established here: `api/`, `features/<module>/{pages,components,hooks}`, types, Zod schemas, and route registration in `routes/index.tsx`.
