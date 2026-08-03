---
name: testing-sirix-local
description: How to run and end-to-end test the Sirix monorepo (Node/Express backend + React/Vite frontend) locally, including seeding demo data and emulating prefers-color-scheme for light/dark visual bugs.
---

# Testing Sirix locally

## Bring the stack up

```bash
cd <repo>
docker compose up -d mongo redis           # Mongo :27017, Redis :6379
cp backend/.env.example backend/.env       # then set MONGO_URI=mongodb://localhost:27017/sirix
                                           # and REDIS_HOST=localhost to run backend on the host
cp frontend/.env.example frontend/.env
cd backend && npm install && npm run seed && npm run seed:demo && npm run dev   # :5000
cd frontend && npm install && npm run dev                                       # :3000, proxies /api -> :5000
```

- If Vite fails with `Cannot find native binding`, run
  `npm i --no-save @rolldown/binding-linux-x64-gnu@<version matching rolldown in the lockfile>` in `frontend`.
- Login: `admin@sirix.io` / `Admin@12345` at http://localhost:3000/login.
- API base is `/api/v1` (see `frontend/src/lib/apiClient.ts` and `env.apiPrefix` in the backend), so a
  quick token for sanity checks is
  `curl -s -X POST localhost:5000/api/v1/auth/login -H 'content-type: application/json' -d '{"email":"admin@sirix.io","password":"Admin@12345"}'`.
- `npm run seed` creates roles/permissions/admin; `npm run seed:demo` creates the accounting demo data
  (invoices INV-1001…, payments PAY-2001…, carrier payments CPY-3001…). Without `seed:demo`,
  /accounting and /reports legitimately show zeros.

## UI map

Sidebar: Dashboard, Diagnostics, Accounting, Reports, Admin. The header user chip (top right) opens a menu
with Profile / Change password / Sign out. Routes live in `frontend/src/routes/index.tsx` — check it before
assuming a page is reachable: at time of writing `/forgot-password` and `/reset-password` are **not**
registered and fall through to the 404 `StatusPage`, so those pages cannot be exercised through the UI.

## Emulating `prefers-color-scheme` for light/dark visual bugs

Chrome runs with CDP on http://localhost:29229. Emulation overrides are dropped when the CDP client
disconnects, so hold the socket open in a background process:

```python
# /tmp/setdark.py — run as: nohup python3 -u /tmp/setdark.py dark &   (kill it to turn the override off)
import asyncio, json, sys, urllib.request, websockets
mode = sys.argv[1]
pages = [t for t in json.load(urllib.request.urlopen('http://localhost:29229/json'))
         if t['type'] == 'page' and 'devtools' not in t['url']]
async def main():
    async with websockets.connect(pages[0]['webSocketDebuggerUrl'], max_size=None) as ws:
        features = [] if mode == 'off' else [{"name": "prefers-color-scheme", "value": mode}]
        await ws.send(json.dumps({"id": 1, "method": "Emulation.setEmulatedMedia",
                                  "params": {"media": "screen", "features": features}}))
        await asyncio.Future()
asyncio.run(main())
```

Reload the page after setting the override. `pkill -f setdark.py` can be flaky in this shell — verify with
`pgrep -af setdark.py`. The DevTools Rendering panel ("Emulate CSS prefers-color-scheme") is the GUI
fallback but clutters the recording.

## Proving a visual/crash fix instead of just showing a working page

A screenshot of a working page looks identical whether or not the emulation/override was actually applied.
Temporarily restore the pre-fix file and reload (Vite HMR picks it up instantly), capture the broken state,
then restore:

```bash
cp frontend/src/components/ui/button.tsx /tmp/button.fixed.tsx
git show HEAD~1:frontend/src/components/ui/button.tsx > frontend/src/components/ui/button.tsx
# ... screenshot the broken state ...
cp /tmp/button.fixed.tsx frontend/src/components/ui/button.tsx
git status --short   # confirm the tree is clean again
```

Note `Button` uses Radix `Slot` when `asChild` is set — passing anything besides a single child (e.g. a
loading spinner slot) throws `Slot failed to slot onto its children`, which the app-level `ErrorBoundary`
turns into a full-page "An error occurred" screen. Pages using `asChild`: ProfilePage, StatusPage
(404/unauthorized), ForgotPasswordPage, ResetPasswordPage.

## Data consistency checks worth making

- /accounting: Revenue − Expenses == Profit; paid invoices must show Balance $0.00 and partially-paid must
  show total − amountPaid (the UI renders the `outstandingBalance` virtual).
- Sum of *completed* payments should equal Revenue; sum of *completed* carrier payments should equal Expenses.
- /reports Revenue/Profit/Outstanding must match /accounting.

## Devin Secrets Needed

None — everything runs locally with the seeded admin account.
