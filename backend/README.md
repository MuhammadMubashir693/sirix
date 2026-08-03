# Sirix Backend — Telecom Carrier Management Platform

Node.js + Express + MongoDB (Mongoose) backend, built module by module.

## Status: Module 2 of 6 — Shared Architecture + Authentication + Admin ✅

Completed in this module:
- Project scaffold: config, controllers, services, repositories, middleware, routes, validators, models, jobs, sockets, utils, docs, tests
- Shared architecture used by every future module:
  - `ApiResponse` — standard `{ success, message, data, pagination, errors }` envelope
  - `ApiError` + global `errorHandler` — consistent error handling (Mongoose validation, duplicate key, JWT errors, etc. all normalized)
  - `asyncHandler` — removes try/catch boilerplate in controllers
  - `BaseRepository` — generic CRUD + pagination, extended by module-specific repositories
  - `auditable` Mongoose plugin — adds `createdBy`, `updatedBy`, soft delete (`isDeleted`, `deletedAt`, `deletedBy`) to every schema, and auto-filters deleted docs out of queries
  - `pagination` utils — parses `page`/`limit`/`sortBy`/`sortOrder` query params consistently
  - `auditLogger` middleware — writes to the `AuditLog` collection after every request completes
  - `validate` middleware — Zod-based request validation for body/query/params
  - `authenticate` + `authorizeRoles` / `authorizePermission` middleware — JWT auth + RBAC
  - `rateLimiter` — global + stricter auth-specific limiter
  - Winston logger, Swagger/OpenAPI wiring, Socket.io base setup (JWT-authenticated handshake)
- Models: `User`, `Role`, `Permission`, `RefreshToken`, `AuditLog`
- Full auth flow:
  - `POST /auth/register`
  - `POST /auth/login` (issues access token + rotating refresh token, refresh token also set as httpOnly cookie)
  - `POST /auth/refresh` (rotation + reuse detection — reusing a revoked token revokes the whole session chain)
  - `POST /auth/logout`
  - `POST /auth/change-password`
  - `POST /auth/forgot-password` / `POST /auth/reset-password`
  - `GET /auth/me`
- Seed script (`npm run seed`) creates default roles (Admin, Manager, Accounting, Operations, Viewer), a full permission matrix per module/action, and a default admin user (`admin@sirix.io` / `Admin@12345` — **change immediately**)
- Jest + Supertest integration tests covering the full auth flow (12 tests) using `mongodb-memory-server`
- Docker + Docker Compose (v2 CLI plugin: `docker compose`, not the old `docker-compose` binary) (app, MongoDB, Redis)
- ESLint + Prettier

## Module 2 — Admin ✅

All routes live under `/admin`, require a valid access token, and are further gated per-route by `authorizePermission('<module>:<action>')` against the seeded permission matrix (the `Admin` role bypasses every check, matching the rest of the app):

- **Users** — `GET/POST /admin/users`, `GET/PUT/DELETE /admin/users/:id`, `PATCH /admin/users/:id/status` (activate/deactivate — deactivating immediately revokes all of that user's refresh tokens). Admin-created users skip the self-service `/auth/register` default-role fallback and require an explicit `roleId`.
- **Roles** — `GET/POST /admin/roles`, `GET/PUT/DELETE /admin/roles/:id`. Built-in (`isSystem`) roles can't be renamed or deleted; roles still assigned to users can't be deleted.
- **Permissions** — `GET/POST /admin/permissions`, `GET/PUT/DELETE /admin/permissions/:id`. The `module:action` key is immutable once created; permissions still assigned to a role can't be deleted.
- **Audit Logs** — `GET /admin/audit-logs` (filterable by module/action/user/date range, paginated), `GET /admin/audit-logs/:id`. Read-only — entries are written automatically by the existing `auditLogger` middleware on every mutating admin route.
- **System Settings** — `GET/PUT /admin/settings` (bulk upsert), `GET/PUT/DELETE /admin/settings/:key`. New `Setting` model: typed (`string`/`number`/`boolean`/`json`) key/value pairs grouped by `group`, with an `isPublic` flag reserved for exposing safe settings to non-admin authenticated users later.
- **Sessions** — `GET /admin/sessions` (active refresh tokens across all users, paginated, filterable by `userId`), `DELETE /admin/sessions/:id`, `DELETE /admin/sessions/user/:userId` (revoke everything for one user).

New shared pieces: `Setting` model + repository, `roleRepository`/`permissionRepository`/`auditLogRepository` (all extend `BaseRepository`), and `adminValidators.js` for every request shape above. The seed script's permission matrix already covered `users`, `roles`, `permissions`, `audit-logs`, and `settings` from module 1 — `sessions` was added to that list for this module.

Jest + Supertest integration tests (`tests/integration/admin.test.js`) cover permission enforcement, user CRUD + deactivation revoking sessions, role creation/duplicate-name/system-role/in-use guards, permission creation/duplicate/in-use guards, audit log listing, settings upsert/fetch, and session listing + revocation.

> Scope note: the original brief also mentioned notification management, API key management, and dashboard-specific settings under "Admin Panel." Notification management belongs with the `Notification` model introduced by the dashboard module (module 3) and API key management wasn't part of the shared architecture from module 1, so both are deferred to keep this module's surface consistent with what's already been built. "Dashboard settings" is covered generically by the `Setting` model's `group` field (e.g. a `dashboard` group) rather than a separate endpoint.

## Not yet built (upcoming modules)
3. Dashboard (summary aggregations, live Socket.io updates, charts)
4. Diagnostics + Relationship Performance + Numbering (CRUD + call diagnostics search/filter)
5. Accounting (Invoices w/ PDF, Payments, Carrier Payments)
6. Reports (CSV/Excel/PDF export across all report types)

## Getting started

```bash
cp .env.example .env      # already done in this delivery; edit secrets before real use
npm install
docker compose up         # starts backend + mongo + redis, creates the shared sirix-network
# or, without Docker:
npm run dev
```

Seed default roles/permissions/admin user (run once, after Mongo is up):
```bash
npm run seed
# or, if running via Docker:
docker compose exec backend npm run seed
```

Optionally, populate the accounting/reports modules with demo data (customers, carriers, vendors, invoices, customer payments, carrier payments spread over the last four months):
```bash
npm run seed:demo
# start from a clean demo dataset instead of updating the existing one:
npm run seed:demo -- --reset
# or, if running via Docker:
docker compose exec backend npm run seed:demo
```

> The compose file creates a `sirix-network` Docker network. The Sirix frontend's `docker-compose.yml` joins this same network (as external) so it can reach this backend by its service name, `backend`.

Run tests:
```bash
npm test
```
> Note: tests use `mongodb-memory-server`, which downloads a MongoDB binary on first run. If you're behind a restrictive firewall/proxy, make sure `fastdl.mongodb.org` is reachable, or point `MONGOMS_SYSTEM_BINARY` at a local `mongod`.

API docs: `http://localhost:5000/api-docs`
Health check: `http://localhost:5000/health`

## Verification performed in this environment
This sandbox's network is restricted to package registries only (no MongoDB binary downloads), so full integration tests couldn't execute here. Instead, verified:
- Every file passes `node --check` (syntax validity)
- `npx eslint src` passes clean (0 errors, 0 warnings)
- `app.js` and its full dependency graph load without runtime errors (Express app instantiates correctly, all routes/middleware/models wire up)
- Fixed a duplicate-index warning caught during this check (removed redundant `userSchema.index({ email: 1 })` since `unique: true` already creates it)

Run `npm test` in your own environment (or via `docker compose up`) to execute the 12 auth integration tests.
