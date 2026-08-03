# Sirix — Telecom Carrier Management Platform

Monorepo layout for local development: `backend/` (Node/Express/MongoDB API) and `frontend/` (React/Vite UI), started together with one command.

## Quickest path: run everything with one command

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

That's it — no manual network creation, no separate startup order to get right. This single root `docker-compose.yml` starts, in order, with real health checks (not just "container started"):

1. **Mongo** and **Redis** — backend waits until each reports actually healthy (`mongosh ping` / `redis-cli ping`), not just "container running"
2. **Backend** — waits for Mongo + Redis to be healthy, then starts; frontend waits for the backend's own `/health` check to pass
3. **Frontend** — starts last, proxying `/api` to `http://backend:5000` inside the shared Docker network

Once it's up:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 (docs at `/api-docs`, health check at `/health`)

Seed default roles/permissions/admin user (one time, after the backend is healthy):
```bash
docker compose exec backend npm run seed
```
Then log in at http://localhost:3000/login with `admin@sirix.io` / `Admin@12345` (change this immediately).

The Accounting and Reports pages are empty on a fresh database — that seed only creates roles, permissions, and the admin user. To fill them with demo customers, carriers, vendors, invoices, and payments:
```bash
docker compose exec backend npm run seed:demo    # add `-- --reset` to rebuild the demo dataset from scratch
```

## Running services individually (without Docker)

If you'd rather run Node directly on your host and only containerize the databases:

```bash
docker compose up -d mongo redis
```

Then, in `backend/.env`, point at localhost instead of the Docker service names:
```
MONGO_URI=mongodb://localhost:27017/sirix
REDIS_HOST=localhost
REDIS_PORT=6379
```

```bash
cd backend && npm install && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

The frontend's Vite dev server proxies `/api` to `http://localhost:5000` by default in this mode (see `frontend/vite.config.ts`).

## Troubleshooting a 502 / "can't reach backend"

A 502 means the proxy couldn't reach the backend at all (connection refused), not that the backend rejected the request. Check, in order:

```bash
docker compose ps                        # is "backend" listed as healthy, not restarting?
docker compose logs backend --tail=50    # what's it actually saying?
curl http://localhost:5000/health        # does the backend respond directly?
```

If `docker compose ps` shows `backend` restarting in a loop, it's almost always Mongo not being ready yet — which this compose file's health checks are specifically designed to prevent. If you still hit this, please share the output of the three commands above.

## Project structure

```
sirix/
  backend/    Node.js + Express + MongoDB API (see backend/README.md)
  frontend/   React 19 + Vite + TypeScript UI (see frontend/README.md)
  docker-compose.yml   Unified stack — the recommended way to run everything
```
